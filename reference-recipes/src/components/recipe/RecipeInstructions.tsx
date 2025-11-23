import React from 'react';

interface RecipeInstructionsProps {
  instructions: any[];
}

const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  return (
    <div className="p-6 bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl mb-8">
      <h3 className="text-xl font-bold text-yellow-400 mb-6">Preparation Steps</h3>
      
      <ol className="space-y-6">
        {instructions.map((step: any, index: number) => (
          <li key={index} className="relative pl-10 pb-6 text-white">
            <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-emerald-900 font-bold">
              {step.number}
            </div>
            <p>{step.step}</p>
            
            {step.equipment?.length > 0 && (
              <div className="mt-2 text-sm text-gray-300">
                <span className="font-semibold">Equipment: </span>
                {step.equipment.map((item: any, i: number) => (
                  <span key={i}>
                    {item.name}{i < step.equipment.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
        
        {instructions.length === 0 && (
          <li className="text-gray-300">Instruction information not available</li>
        )}
      </ol>
      
      <div className="mt-6 pt-4 border-t border-emerald-700/30">
        <h4 className="text-white font-semibold mb-2">Time-saving Tip for Ramadan</h4>
        <p className="text-gray-300 text-sm">
          Consider preparing components of this recipe ahead of time to reduce preparation time during busy Ramadan hours.
        </p>
      </div>
    </div>
  );
};

export default RecipeInstructions;
