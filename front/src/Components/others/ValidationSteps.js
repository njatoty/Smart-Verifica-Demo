import { t } from 'i18next';
import React from 'react';

const ValidationSteps = ({ stage = 'v1', status='', onOpenInfos }) => {

    return (
        <div className="max-w-md bg-white rounded-lg">
            <div className="flex items-stretch w-full">
                {/* Step 1 */}
                <div className="flex items-center flex-grow">
                    <div className={`px-4 py-2 flex text-xs items-center rounded-l-full ${stage === 'v1' ? 'bg-blue-optimum text-white' : 'bg-slate-200 text-gray-500'}`}>
                        <span>Validation 1</span>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center flex-grow">
                    <div className={`px-4 py-2 flex text-xs items-center ${status !== 'temporarily-rejected' ? 'rounded-r-full' : ''} ${stage === 'v2' ? 'bg-blue-optimum text-white' : 'bg-slate-200 text-gray-500'}`}>
                        <span>Validation 2</span>
                    </div>
                </div>

                {/* Temporarily rejected */}
                {
                    status === 'temporarily-rejected' &&
                    <button className="flex items-center flex-grow" onClick={() => onOpenInfos && onOpenInfos(true)}>
                        <div className={`px-4 py-2 flex text-xs items-center rounded-r-full bg-yellow-500 text-white`}>
                            <span>{t('temporarily-rejected')}</span>
                            {/* <InfoOutlined fontSize='16' className='ml-1' /> */}
                        </div>
                    </button>
                }
            </div>
        </div>
    );
};

export default ValidationSteps;
