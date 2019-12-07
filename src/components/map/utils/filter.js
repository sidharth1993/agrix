import geo from '../static/clipped_poly';
import cloneDeep from 'lodash/cloneDeep';

export const filterGeo = (checked)=>{
    var f;
        f = cloneDeep(geo);
        if(checked)
            f.features = f.features.filter(feature => checked.indexOf(feature.properties.yield) !== -1);
    return f;
};