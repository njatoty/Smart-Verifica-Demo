import React, { useState } from 'react';

const ValidationSteps = React.memo(({ stage = 'v1' }) => {

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg">
            <div className="flex items-center">
                {/* Step 1 */}
                <div className="flex items-center">
                    <div className={`px-4 py-2 flex text-xs items-center rounded-l-full ${stage === 'v1' ? 'bg-blue-optimum text-white' : 'bg-slate-200 text-gray-500'}`}>
                        <span>Validation 1</span>
                    </div>
                </div>

                {/* Arrow */}
                {/* <div className={`w-0 h-0 border-l-[20px] rotate-90 border-l-transparent border-t-[20px] ${validationStage === 'v1' ? 'border-t-blue-500' : 'border-t-gray-300'} border-r-[20px] border-r-transparent`}></div> */}

                {/* Step 2 */}
                <div className="flex items-center">
                    <div className={`px-4 py-2 flex text-xs items-center rounded-r-full ${stage === 'v2' ? 'bg-blue-optimum text-white' : 'bg-slate-200 text-gray-500'}`}>
                        <span>Validation 2</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ValidationSteps;
