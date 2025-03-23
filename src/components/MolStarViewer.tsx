import { useEffect, useRef } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

interface MolStarViewerProps {
  width?: number;
  height?: number;
  pdbUrl?: string;
}



// 

const MolStarViewer = ({ 
  width = 800, 
  height = 600,
  pdbUrl = '/Aichi virus/PDB/5AOO_chain_B.pdb'
}: MolStarViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  

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
        // Try to load a PDB file
        await plugin.clear();
        
        // Get data from URL
        const data = await plugin.builders.data.download({ url: pdbUrl }, { state: { isGhost: true } });
        
        // Parse and create the structure
        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb');
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model);
        
        // Create a component representation
        const representation = await plugin.builders.structure.representation.addRepresentation(structure, {
          type: 'cartoon',
          color: 'chain-id'
        });
        
        // Make sure the structure is centered in view
        await plugin.managers.camera.reset();
        
        console.log('Structure loaded successfully');
      } catch (error) {
        console.error('Error loading structure:', error);
      }
    };

    init();
    
    return () => {
      if (plugin) {
        plugin.dispose();
      }
    };
  }, [pdbUrl]);

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
    </div>
  );
};

export default MolStarViewer;