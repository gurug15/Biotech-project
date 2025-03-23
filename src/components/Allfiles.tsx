import { useEffect, useRef, useState } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

interface MolStarViewerProps {
  width?: number;
  height?: number;
  fileUrl?: string;
  fileFormat?: 'pdb' | 'cif';
  isAlphaFold?: boolean;
}

const MolStarViewer = ({ 
  width = 800, 
  height = 600,
  fileUrl = 'https://alphafold.ebi.ac.uk/files/AF-P02768-F1-model_v4.cif',
  fileFormat = 'cif',
  isAlphaFold = true
}: MolStarViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let plugin: any = null;
    
    const init = async () => {
      // First create the plugin instance
      plugin = await createPluginUI({
        target: containerRef.current,
        render: renderReact18
      });
      
      try {
        // Clear any existing structures
        await plugin.clear();
        
        // Get data from URL
        const data = await plugin.builders.data.download({ url: fileUrl }, { state: { isGhost: true } });
        
        // Parse the trajectory based on file format
        const trajectory = await plugin.builders.structure.parseTrajectory(data, fileFormat);
        
        // For AlphaFold models, use the specific preset
        if (isAlphaFold) {
          // Apply AlphaFold preset
          const preset = {
            id: 'preset-alphafold-model',
            params: {}
          };
          await plugin.builders.structure.hierarchy.applyPreset(trajectory, preset);
          
          // Ensure the B-factor coloring is applied for AlphaFold confidence
          const model = await plugin.builders.structure.createModel(trajectory);
          const structure = await plugin.builders.structure.createStructure(model);
          
          // Add representation with pLDDT coloring (B-factor)
          await plugin.builders.structure.representation.addRepresentation(structure, {
            type: 'cartoon',
            color: 'operator-b-factor',
            colorParams: { 
              // AlphaFold pLDDT score coloring ranges
              min: 50,
              max: 90,
              minColor: { r: 1, g: 0, b: 0 },    // Red for low confidence
              midColor: { r: 1, g: 1, b: 0 },    // Yellow for medium confidence
              maxColor: { r: 0, g: 1, b: 0 },    // Green for high confidence
              manualSteps: [
                { value: 50, color: { r: 1, g: 0, b: 0 } },
                { value: 70, color: { r: 1, g: 1, b: 0 } },
                { value: 90, color: { r: 0, g: 1, b: 0 } }
              ]
            }
          });
        } else {
          // Use default preset for non-AlphaFold models
          await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
        }
        
        // Make sure the structure is centered in view
        await plugin.managers.camera.reset();
        
        console.log('Structure loaded successfully');
      } catch (error) {
        console.error('Error loading structure:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    
    return () => {
      if (plugin) {
        plugin.dispose();
      }
    };
  }, [fileUrl, fileFormat, isAlphaFold]);

  return (
    <div style={{ width, height, position: 'relative', margin: '0 auto' }}>
      <div 
        ref={containerRef} 
        id="molstar-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: '1px solid #ccc',
          overflow: 'hidden'
        }} 
      />
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '10px 20px',
          borderRadius: '4px'
        }}>
          Loading structure...
        </div>
      )}
    </div>
  );
};

export default MolStarViewer;