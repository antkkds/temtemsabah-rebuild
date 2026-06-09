import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <main>
      <div className="bg-[#f8f6f1] py-16 text-center">
        <h1 className="font-['Prata'] text-4xl text-[#03081e] mb-2">Contact Us</h1>
        <p className="font-['Work_Sans'] text-[#555]">Get in touch with Tem Tem Sabah</p>
      </div>
      <Contact />
    </main>
  );
}
