import React from 'react'
import Tabs from '../data-source/tabs'
import SupplierPage from '../data-source/supplier/page'

export const DataSource = () => {

    const tabs = [{
            label: "Supplier",
            content: <SupplierPage />
        }
    ]
    return (
        <div className='flex flex-col h-full flex-grow'>
            <Tabs tabs={tabs} />
        </div>
    )
}

export default DataSource