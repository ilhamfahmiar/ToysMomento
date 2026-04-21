import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProductDetailSection from "@/components/sections/ProductDetailSection";
import TestimoniSection from "@/components/sections/TestimoniSection";
import OrderFormSection from "@/components/sections/OrderFormSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ProductDetailSection />
        <TestimoniSection />
        <OrderFormSection />
      </main>
      <Footer />
    </>
  );
}
