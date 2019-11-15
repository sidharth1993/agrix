import geo from '../static/clipped_poly';
import cloneDeep from 'lodash/cloneDeep';
import lulc from '../static/lulc';
import dutch from '../static/netherlands';

export const filterGeo = (legends, main)=>{
    var f;
        f = cloneDeep(geo);
    return f;
};

export const filterLulc = (legends, main)=>{
    var f;
        f = cloneDeep(lulc);
    return f;
};

export const getNetherlands = ()=>{
    var f;
    f = cloneDeep(dutch)
    return f;
}