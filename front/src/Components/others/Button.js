import React from 'react'

const Button = ({ loading= false }) => {
    return (
        <button type="button" class="custom__button">
            {
                loading && <div
                    class="inline-block h-3 w-3 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                >
                        <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                            Loading...
                        </span>
                </div>
            }
            Return
        </button>
    )
}

export default Button