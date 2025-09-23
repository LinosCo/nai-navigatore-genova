import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";

const Map = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <MapView />
      </main>
      
      <Footer />
    </div>
  );
};

export default Map;