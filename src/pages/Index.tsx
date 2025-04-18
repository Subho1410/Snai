
import { useEffect, useState } from "react";
import { ModelInfo, fetchModels } from "@/services/api";
import Chat from "@/components/Chat";

const Index = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelData = await fetchModels();
        setModels(modelData);
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold gradient-text">Loading BetaChat</h3>
            <div className="typing-indicator mx-auto">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      ) : (
        <Chat models={models} />
      )}
    </div>
  );
};

export default Index;
