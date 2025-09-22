import Navigation from "@/components/Navigation";
import MapView from "@/components/MapView";

const Map = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MapView />
      </main>
    </div>
  );
};

export default Map;