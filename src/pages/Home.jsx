import Hero from '../components/Hero';
import Features from '../components/Features';
import Mission from '../components/Mission';
import Team from '../components/Team';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Mission />
      <Team />
      {/* <Contact /> — hidden, keep for future use */}
    </main>
  );
}
