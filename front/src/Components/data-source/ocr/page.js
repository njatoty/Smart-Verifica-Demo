import React, { useEffect, useState } from 'react'
import DynamicKeysList from './list'
import { DynamicKeysAddForm } from './forms'
import { getCustomerById, updateCustomerDynamicKeys } from '../../services/customer-service';
import { JsonEditor } from 'json-edit-react';
import { t } from 'i18next';

const OCRDynamicKeys = () => {

    const [keys, setKeys] = useState([]);
    const [action, setAction] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [message, setMessage] = useState('');
    const customerId = '67514c02a36d01d14c04de95';


    function handleUpateKey(item) {
        setAction('update');
        setCurrentItem(item);
    }


    function handleCancel() {
        setAction('add');
        setCurrentItem(null);
    }


    function handleSuccess(data) {
        const dynamicKeys = data.sort((a, b) => a.order - b.order)
        setKeys(dynamicKeys);
    }

    useEffect(() => {
        getCustomerById(customerId).then(data => {
            if (data?._id) {

                const dynamicKeys = data.dynamicKeys.sort((a, b) => a.order - b.order)
                setKeys(dynamicKeys);
            }
        });
    }, []);

    
    async function handleDeleteKey(item) {

        const response = await updateCustomerDynamicKeys(customerId, {
            name: item.name,
            action: "remove"
        }, action);
        setMessage(response.message);
        if (response.customer) setKeys(response.customer.dynamicKeys);
        setTimeout(() => {
            setMessage('');
        }, 5000); 
        
    }
    

    return (
        <div className='flex items-stretch gap-5 flex-grow h-full'>
            <div className='w-full max-w-[500px] '>
                <h2 className="text-sm text-gray-600 font-semibold">{action === 'add' ? t('add') : t('update')} {t('dynamic-keys')}</h2>
                <DynamicKeysAddForm
                    currentItem={currentItem}
                    formAction={action}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                />
                {message && <p className="my-3 p-2 bg-orange-100 text-orange-600 rounded-sm text-sm">{message}</p>}
            </div>
            <div className='w-full max-w-[500px] h-full flex flex-col border-l border-gray-300 pl-5'>
                <h2 className='px-4 text-sm text-gray-600 font-semibold'>{t('dynamic-list-title')}</h2>
                <div className='h-full relative sb overflow-y-auto'>
                    <div className='absolute inset-0 w-full h-full p-4'>
                        <DynamicKeysList
                            customerId={customerId}
                            setDynamicKeys={setKeys}
                            currentItem={currentItem}
                            dynamicKeys={keys}
                            onUpdate={handleUpateKey}
                            setMessage={setMessage}
                            onDelete={handleDeleteKey}
                        />
                    </div>
                </div>
            </div>
            <div className='flex-grow w-full' hidden>
                <div className='h-full relative sb overflow-y-auto'>
                    <div className='absolute inset-0 w-full h-full p-4'>
                        <JsonEditor
                            data={ keys.map(k => ({ name: k.name, order: k.order })) }
                            theme="githubLight"
                            restrictEdit={true}
                            restrictAdd={true}
                            restrictDelete={true}
                            restrictDrag={true}
                            restrictTypeSelection={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OCRDynamicKeys