import ContactForm from "@/components/contact-form";



export default async function Home() {

  return (
    <main className=" min-h-screen py-12 px-4">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h1 className=" text-4xl font-bold mb-4">Server Action Demo</h1>
          <p className=" text-2xl  text-gray-600 max-w-2xl mx-auto"> Contact form with mongoDb and revalidation</p>

        </div>
        <ContactForm />
      </div>
    </main>
  );
}
