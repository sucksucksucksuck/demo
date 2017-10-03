/**
 * Created by SUN on 2016/10/10.
 */

import {connect} from 'react-redux';
export default function (mapStateToProps, mapDispatchToProps, mergeProps) {
    return connect(mapStateToProps, mapDispatchToProps, mergeProps, {withRef: true});
}