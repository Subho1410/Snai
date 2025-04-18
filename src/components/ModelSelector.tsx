
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ModelInfo } from "@/services/api";

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

const ModelSelector = ({ models, selectedModel, onSelectModel }: ModelSelectorProps) => {
  const [selectedModelName, setSelectedModelName] = useState<string>("Loading models...");

  useEffect(() => {
    if (models.length > 0) {
      const model = models.find(m => m.id === selectedModel);
      setSelectedModelName(model ? model.id.split('/')[1] : selectedModel);
    }
  }, [selectedModel, models]);

  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId);
  };

  // Group models by provider
  const groupedModels = models.reduce<Record<string, ModelInfo[]>>((acc, model) => {
    const provider = model.id.split('/')[0];
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {});

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto flex justify-between items-center">
          <span className="truncate">{selectedModelName}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] max-h-[400px] overflow-y-auto">
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <div key={provider} className="py-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              {provider}
            </div>
            {providerModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                className={`cursor-pointer ${selectedModel === model.id ? 'bg-primary/10' : ''}`}
                onClick={() => handleSelectModel(model.id)}
              >
                <div className="flex flex-col">
                  <span>{model.id.split('/')[1]}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.costPerMillion ? `$${model.costPerMillion}/M tokens` : 'Free'}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
