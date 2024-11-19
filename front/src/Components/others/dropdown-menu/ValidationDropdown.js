import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    incrementPrevalidation,
    incrementReturned,
    incrementValidationV2,
    incrementValidated,
    resetCounts,
    incrementRejected,
} from './../../redux/store';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import fileService from '../../services/fileService';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import useSocketEvent from '../../../hooks/useSocketEvent';

const ValidationDropdown = ({user}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();
    const {
        prevalidationCount,
        rejectedCount,
        validationV2Count,
        validatedCount
    } = useSelector((state) => state.documents);


    // console.log("rolle === ", role);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    function updateCounts () {
        fileService.fetchDocumentCounts()
        .then(counts => {
            if (!counts) return;
            dispatch(resetCounts())
            dispatch(incrementPrevalidation(counts.prevalidationCount[0]?.count || 0));
            dispatch(incrementReturned(counts.returnedCount[0]?.count || 0));
            dispatch(incrementValidationV2(counts.validationV2Count[0]?.count || 0));
            dispatch(incrementValidated(counts.validatedCount[0]?.count || 0));
            dispatch(incrementRejected(counts.rejectedCount[0]?.count || 0));
        })
    }

    useSocketEvent('document-changed', () => {
        // update counts
        updateCounts();
    });
    
    useSocketEvent('document-incoming', () => {
        // update counts
        updateCounts();
    });


    useEffect(() => {
        updateCounts();
    }, [])


    useEffect(() => {
        // Array of paths that should open the validation menu
        const validationPaths = ['/validation', '/prevalidation', '/returned', '/validated', '/rejected'];
        // Open the validation menu if the current path is in validationPaths
        setIsDropDownOpen(validationPaths.includes(location.pathname));

    }, [location]);


    const toggleValidationMenu = () => {
        setIsDropDownOpen(!isDropDownOpen);
    };

    const sc = (count = 0) => count > 9 ? `+9` : count;

    return (
        <li className='dropdown-menu'>
            <button onClick={toggleValidationMenu} className={`menu-item flex justify-between items-center ${isDropDownOpen ? 'open' : 'close'}`}>
                Validation
                {isDropDownOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </button>
            {
                isDropDownOpen && (
                    <ul className="ml-2 pl-4 py-1 space-y-1 border-l-2">
                        {(user?.role === "admin" || user?.role === "agent V1") && (<li>
                            <NavLink to="/prevalidation" className='menu-item' title={`${t('prevalidation')} ${prevalidationCount}`}>
                                {t('prevalidation')} v1 {prevalidationCount > 0 && <span>{sc(prevalidationCount)}</span>}
                            </NavLink>
                        </li>)}
                        {(user?.role === "admin" || user?.role === "agent V2") && (<li>
                            <NavLink to="/validation" className='menu-item' title={`Validation ${validationV2Count}`}>
                                Validation v2 {validationV2Count > 0 && <span>{sc(validationV2Count)}</span>}
                            </NavLink>
                        </li>)}
                        {(user?.role === "admin" || user?.role === "agent V2") && (<li>
                            <NavLink to="/rejected" className='menu-item' title={`${t('rejected')} ${rejectedCount}`}>
                                {t('rejected')} {rejectedCount > 0 && <span>{sc(rejectedCount)}</span>}
                            </NavLink>
                        </li>)}
                        {(user?.role === "admin" ) && (<li>
                            <NavLink to="/validated" className='menu-item' title={`${t('validated-menu')} ${validatedCount}`}>
                                {t('validated-menu')} {validatedCount > 0 && <span>{sc(validatedCount)}</span>}
                            </NavLink>
                        </li>)}
                    </ul>
                )
            }
        </li>

    )
}

export default ValidationDropdown