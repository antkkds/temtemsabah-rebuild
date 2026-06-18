import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

const temtemGreen = '#00373e';
const highlightGold = '#f5c842';
const baseCountry = '#e8f5e9';
const strokeColor = '#d0d0d0';
const activeFill = '#fef9e7';
const logoPath = import.meta.env.BASE_URL + 'temtem-map-icon.png';
const markerSize = 24;

// ── Origin: Sabah, Borneo ──
const ORIGIN = { lat: 5.5, lng: 116.5, name: 'Sabah' };

// ── Default reached entry (always shown, not in admin) ──
const WEST_MALAYSIA = {
  country_name: 'West Malaysia',
  country: 'MY',
  states: ['Peninsular Malaysia'],
  lat: 3.139,
  lng: 101.686,
  isDefault: true,
};

export default function WorldMap() {
  const { t, lang } = useLanguage();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const animStarted = useRef(false);
  const animFrameId = useRef(null);
  const zoomRef = useRef(null);
  const currentTransform = useRef(d3.zoomIdentity);

  useEffect(() => {
    supabase.from('global_reach').select('*').order('country_name', { ascending: true })
      .then(({ data }) => setCountries(data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = 500;
    const alreadyAnimated = animStarted.current;

    d3.select(svgRef.current).selectAll('*').remove();
    currentTransform.current = d3.zoomIdentity;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // ── Projection ──
    const projection = d3.geoMercator()
      .scale(width / 6.28)
      .center([0, 20])
      .translate([width / 2, height / 1.45]);
    const path = d3.geoPath().projection(projection);

    // ── Build reached list (DB + default) ──
    const reached = [...countries];
    const hasWestMY = countries.some(c => c.country_name === 'West Malaysia');
    if (!hasWestMY) reached.unshift(WEST_MALAYSIA);

    const findMatch = (name) => reached.find(c =>
      c.country_name?.toLowerCase() === name?.toLowerCase() ||
      c.country?.toLowerCase() === name?.toLowerCase()
    );

    // ── Two-layer SVG structure ──
    const mapLayer = svg.append('g').attr('class', 'map-layer');   // zoomed
    const overlay = svg.append('g').attr('class', 'overlay');       // fixed-size

    // ── DRAW MAP (zoomed) ──
    const features = topojson.feature(worldData, worldData.objects.countries);

    // Graticule
    mapLayer.append('path')
      .datum(d3.geoGraticule()())
      .attr('d', path)
      .attr('fill', 'none').attr('stroke', '#e8e8e8')
      .attr('stroke-width', 0.3).attr('pointer-events', 'none');

    // Countries
    mapLayer.selectAll('path.country')
      .data(features.features)
      .join('path')
      .attr('class', 'country').attr('d', path)
      .attr('fill', d => {
        if (d.properties.name === 'Malaysia') return activeFill;
        return findMatch(d.properties.name) ? activeFill : baseCountry;
      })
      .attr('stroke', d => {
        if (d.properties.name === 'Malaysia') return highlightGold;
        return findMatch(d.properties.name) ? highlightGold : strokeColor;
      })
      .attr('stroke-width', d => {
        if (d.properties.name === 'Malaysia') return 1.5;
        return findMatch(d.properties.name) ? 1.5 : 0.5;
      })
      .style('cursor', 'pointer').style('transition', 'fill 0.15s')
      .on('mouseenter', (event, d) => {
        const name = d.properties.name;
        const matched = name === 'Malaysia' || !!findMatch(name);
        d3.select(event.target).attr('fill', matched ? '#b8e8e5' : '#e0e0e0');
        const rect = event.target.getBoundingClientRect();
        setTooltip({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2, name, data: findMatch(name) || null });
      })
      .on('mouseleave', (event, d) => {
        const name = d.properties.name;
        const matched = name === 'Malaysia' || !!findMatch(name);
        setTooltip(null);
        d3.select(event.target).attr('fill', matched ? activeFill : baseCountry)
          .attr('stroke-width', matched ? 1.5 : 0.5);
      });

    // ── Build destination list with explicit lat/lng ──
    const destinations = [];

    // West Malaysia (always first destination)
    destinations.push({
      ...WEST_MALAYSIA,
      lat: WEST_MALAYSIA.lat,
      lng: WEST_MALAYSIA.lng,
      sortOrder: 0,
    });

    // Other countries from DB (skip Malaysia since West Malaysia covers it)
    reached.forEach(c => {
      if (c.isDefault) return;
      if (c.country_name === 'Malaysia') return; // West Malaysia covers it
      if (!c.lat && c.lng) return;
      destinations.push({
        ...c,
        lat: c.lat,
        lng: c.lng,
        sortOrder: c.country_name === 'Singapore' ? 2 : c.country_name === 'Brunei' ? 1 : c.country_name === 'Thailand' ? 3 : c.country_name === 'Taiwan' ? 4 : 99,
      });
    });

    // Sort: West Malaysia first, then by proximity to Sabah
    destinations.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const dA = Math.hypot(a.lng - ORIGIN.lng, a.lat - ORIGIN.lat);
      const dB = Math.hypot(b.lng - ORIGIN.lng, b.lat - ORIGIN.lat);
      return dA - dB;
    });

    // ── Helper: geo → screen (with current zoom) ──
    const geoToScreen = (lat, lng) => {
      const px = projection([lng, lat]);
      if (!px) return null;
      const t = currentTransform.current;
      return [t.x + px[0] * t.k, t.y + px[1] * t.k];
    };

    // ── Render static markers (on overlay, NOT zoomed) ──
    const markerGroup = overlay.append('g').attr('class', 'markers');

    function addStaticMarker(dest, atEnd) {
      if (!atEnd) return; // only add after animation
      const screen = geoToScreen(dest.lat, dest.lng);
      if (!screen) return;

      markerGroup.append('image')
        .attr('href', logoPath)
        .attr('x', screen[0] - markerSize / 2)
        .attr('y', screen[1] - markerSize / 2)
        .attr('width', markerSize)
        .attr('height', markerSize)
        .attr('class', 'temtem-marker')
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))')
        .style('animation', `temtemPulse 3s ease-in-out ${Math.random() * 2}s infinite`)
        .on('mouseenter', (event) => {
          const rect = event.target.getBoundingClientRect();
          setTooltip({
            x: rect.left + rect.width / 2, y: rect.top,
            name: dest.country_name,
            data: dest,
          });
          d3.select(event.target)
            .transition().duration(150)
            .attr('width', markerSize * 1.3).attr('height', markerSize * 1.3)
            .attr('x', screen[0] - markerSize * 1.3 / 2)
            .attr('y', screen[1] - markerSize * 1.3 / 2);
        })
        .on('mouseleave', (event) => {
          setTooltip(null);
          d3.select(event.target)
            .transition().duration(150)
            .attr('width', markerSize).attr('height', markerSize)
            .attr('x', screen[0] - markerSize / 2)
            .attr('y', screen[1] - markerSize / 2);
        });
    }

    // ── Origin marker (Sabah) ──
    const originScreen = geoToScreen(ORIGIN.lat, ORIGIN.lng);
    if (originScreen) {
      overlay.append('circle')
        .attr('cx', originScreen[0]).attr('cy', originScreen[1])
        .attr('r', 5).attr('fill', highlightGold).attr('stroke', 'white')
        .attr('stroke-width', 2).style('pointer-events', 'none');
      overlay.append('text')
        .attr('x', originScreen[0] + 10).attr('y', originScreen[1] + 4)
        .attr('font-size', '10px').attr('fill', temtemGreen)
        .attr('font-weight', 600).style('font-family', "'Work Sans', sans-serif")
        .text(t(T.countryNames.Sabah || { en: 'Sabah' }));
    }

    // ── ZOOM ──
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[-width, -height], [width * 2, height * 2]])
      .on('zoom', (event) => {
        currentTransform.current = event.transform;
        mapLayer.attr('transform', event.transform);

        // Update marker positions
        markerGroup.selectAll('image').each(function(d, i) {
          // Find the matching destination data
          const dest = destinations[i];
          if (!dest) return;
          const screen = geoToScreen(dest.lat, dest.lng);
          if (!screen) return;
          d3.select(this)
            .attr('x', screen[0] - markerSize / 2)
            .attr('y', screen[1] - markerSize / 2);
        });
      });

    svg.call(zoom);
    svg.on('dblclick.zoom', (event) => {
      event.preventDefault();
      const [x, y] = d3.pointer(event, svgRef.current);
      svg.transition().duration(300).call(zoom.scaleBy, 1.4, [x, y]);
    });

    zoomRef.current = zoom;

    // ── Auto-zoom to reached area ──
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const topoMatchNames = new Set(destinations.map(d => d.country_name?.toLowerCase()));
    // Also match "Malaysia" TopoJSON
    topoMatchNames.add('malaysia');

    features.features.forEach(d => {
      const name = d.properties.name;
      if (!name || !topoMatchNames.has(name.toLowerCase()) && name !== 'Malaysia') return;
      try {
        const b = path.bounds(d);
        if (isFinite(b[0][0])) {
          minX = Math.min(minX, b[0][0]); minY = Math.min(minY, b[0][1]);
          maxX = Math.max(maxX, b[1][0]); maxY = Math.max(maxY, b[1][1]);
        }
      } catch {}
    });

    if (isFinite(minX) && isFinite(maxX) && maxX > minX && maxY > minY) {
      const contentW = maxX - minX;
      const contentH = maxY - minY;
      const padding = Math.min(Math.max(contentW, contentH) * 0.4, 150, Math.min(width, height) * 0.15);
      const bw = contentW + padding * 2;
      const bh = contentH + padding * 2;
      const s = Math.min(width / bw, height / bh, 5);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const t = d3.zoomIdentity
        .translate(width / 2, height / 2).scale(s).translate(-cx, -cy);
      svg.call(zoom.transform, t);
    }

    // ── Zoom control functions ──
    const zoomIn = () => svg.transition().duration(300).call(zoom.scaleBy, 1.5);
    const zoomOut = () => svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
    const resetZoom = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    svgRef.current.__zoomIn = zoomIn;
    svgRef.current.__zoomOut = zoomOut;
    svgRef.current.__resetZoom = resetZoom;

    // ── ANIMATION SEQUENCE ──
    if (!alreadyAnimated && destinations.length > 0) {
      animStarted.current = true;
      const animateLayer = overlay.append('g').attr('class', 'animate-layer');
      const originPx = projection([ORIGIN.lng, ORIGIN.lat]);

      function drawTrail(idx) {
        const dest = destinations[idx];
        const destPx = projection([dest.lng, dest.lat]);
        if (!originPx || !destPx) return;
        const midX = (originPx[0] + destPx[0]) / 2;
        const midY = (originPx[1] + destPx[1]) / 2 - 70;

        overlay.append('path')
          .datum(dest)
          .attr('class', 'flight-trail')
          .attr('d', `M${originPx[0]},${originPx[1]} Q${midX},${midY} ${destPx[0]},${destPx[1]}`)
          .attr('fill', 'none').attr('stroke', highlightGold)
          .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4')
          .attr('opacity', 0)
          .transition().duration(400).delay(100).attr('opacity', 0.4)
          .transition().duration(400).delay(1600).attr('opacity', 0)
          .remove();
      }

      function flyTo(idx) {
        if (idx >= destinations.length) { return; }
        const dest = destinations[idx];
        const destPx = projection([dest.lng, dest.lat]);
        if (!originPx || !destPx) {
          addStaticMarker(dest, true);
          setTimeout(() => flyTo(idx + 1), 200);
          return;
        }

        drawTrail(idx);

        const flyG = animateLayer.append('g');
        flyG.append('image')
          .attr('href', logoPath)
          .attr('x', -14).attr('y', -14)
          .attr('width', 28).attr('height', 28)
          .style('filter', 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))');

        flyG.append('circle')
          .attr('r', 16).attr('fill', highlightGold).attr('opacity', 0.15);

        const duration = 2200;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const tRaw = Math.min(elapsed / duration, 1);
          // ease-in-out cubic
          const ease = tRaw < 0.5 ? 4 * tRaw * tRaw * tRaw : 1 - Math.pow(-2 * tRaw + 2, 3) / 2;

          // Interpolate in projected pixel space
          const x = originPx[0] + (destPx[0] - originPx[0]) * ease;
          const y = originPx[1] + (destPx[1] - originPx[1]) * ease;
          const arc = Math.sin(ease * Math.PI) * 70;
          const scale = 0.15 + Math.sin(ease * Math.PI) * 1.05;
          const opacity = tRaw > 0.88 ? 1 - (tRaw - 0.88) / 0.12 : 1;

          // Apply current zoom transform so flying logo follows zoom
          const t = currentTransform.current;
          const sx = t.x + x * t.k;
          const sy = t.y + y * t.k;

          flyG.attr('transform', `translate(${sx},${sy}) scale(${scale})`);
          flyG.select('image').style('opacity', opacity);
          flyG.select('circle').attr('opacity', 0.15 * opacity);

          if (tRaw < 1) {
            animFrameId.current = requestAnimationFrame(tick);
          } else {
            flyG.remove();
            addStaticMarker(dest, true);
            setTimeout(() => flyTo(idx + 1), 450);
          }
        }
        animFrameId.current = requestAnimationFrame(tick);
      }

      setTimeout(() => flyTo(0), 800);
    } else if (alreadyAnimated) {
      // Re-render — add all markers at final positions
      destinations.forEach(dest => {
        const screen = geoToScreen(dest.lat, dest.lng);
        if (!screen) return;
        markerGroup.append('image')
          .attr('href', logoPath)
          .attr('x', screen[0] - markerSize / 2)
          .attr('y', screen[1] - markerSize / 2)
          .attr('width', markerSize).attr('height', markerSize)
          .attr('class', 'temtem-marker')
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))')
          .style('animation', `temtemPulse 3s ease-in-out ${Math.random() * 2}s infinite`)
          .on('mouseenter', (event) => {
            const rect = event.target.getBoundingClientRect();
            setTooltip({ x: rect.left + rect.width / 2, y: rect.top, name: dest.country_name, data: dest });
            d3.select(event.target).transition().duration(150)
              .attr('width', markerSize * 1.3).attr('height', markerSize * 1.3)
              .attr('x', screen[0] - markerSize * 1.3 / 2).attr('y', screen[1] - markerSize * 1.3 / 2);
          })
          .on('mouseleave', (event) => {
            setTooltip(null);
            d3.select(event.target).transition().duration(150)
              .attr('width', markerSize).attr('height', markerSize)
              .attr('x', screen[0] - markerSize / 2).attr('y', screen[1] - markerSize / 2);
          });
      });
    }

    // Cleanup animation on unmount
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [loading, countries, lang, t]);

  const handleZoomIn = () => svgRef.current?.__zoomIn?.();
  const handleZoomOut = () => svgRef.current?.__zoomOut?.();
  const handleReset = () => {
    svgRef.current?.__resetZoom?.();
    setTooltip(null);
  };

  const btnStyle = {
    width: 36, height: 36, borderRadius: 6,
    background: 'white', border: '1px solid #e5e7eb',
    cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#00373e', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'all 0.15s', lineHeight: 1,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 500, background: '#f9fafb', borderRadius: 12, overflow: 'hidden' }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
          {t({en:'Loading map...',ms:'Memuatkan peta...','zh-CN':'地图加载中...','zh-TW':'地圖加載中...'})}
        </div>
      ) : (
        <>
          <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
            <button onClick={handleZoomIn} title="Zoom in" style={btnStyle}
              onMouseEnter={e => e.target.style.background = '#f0fdf4'}
              onMouseLeave={e => e.target.style.background = 'white'}>+</button>
            <button onClick={handleZoomOut} title="Zoom out" style={btnStyle}
              onMouseEnter={e => e.target.style.background = '#f0fdf4'}
              onMouseLeave={e => e.target.style.background = 'white'}>−</button>
            <button onClick={handleReset} title="Reset view" style={{ ...btnStyle, fontSize: '0.8rem' }}
              onMouseEnter={e => e.target.style.background = '#f0fdf4'}
              onMouseLeave={e => e.target.style.background = 'white'}>⟲</button>
          </div>

          <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: '0.65rem', color: '#bbb',
            background: 'rgba(255,255,255,0.8)', borderRadius: 4, padding: '2px 6px', pointerEvents: 'none' }}>
            {t(T.globalReach.touch_hint)}
          </div>

          {tooltip && (
            <div style={{ position: 'fixed', left: tooltip.x + 15, top: tooltip.y - 10,
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '0.5rem 0.8rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000, pointerEvents: 'none', fontSize: '0.85rem', maxWidth: 220 }}>
              <div style={{ fontWeight: 600, color: temtemGreen }}>
                {t(T.countryNames[tooltip.name] || { en: tooltip.name })}
              </div>
              {tooltip.data ? (
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  <span style={{ color: highlightGold }}>●</span> Tem Tem Sabah present
                  {tooltip.data.states && tooltip.data.states.length > 0 && (
                    <div style={{ marginTop: '0.15rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                      {tooltip.data.states.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '0.2rem' }}>
                  No data yet
                </div>
              )}
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 36, right: 12,
            background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '0.5rem 0.8rem',
            border: '1px solid #e5e7eb', fontSize: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <img src={logoPath} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />
              <span style={{ color: '#4b5563' }}>{t(T.globalReach.legend_reached)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: baseCountry, border: `1px solid ${strokeColor}` }} />
              <span style={{ color: '#9ca3af' }}>{t(T.globalReach.legend_no_data)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
