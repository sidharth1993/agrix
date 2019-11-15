import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import Header from './components/header';
import Map from './components/map/Map';
import DrawMap from './components/map/DrawMap';
import Analysis from './components/analysis';
import Draw from './components/draw';
import UploadModal from './components/map/UploadModal';
import { fromLonLat } from 'ol/proj';

function Main(props) {
    const [showDraw, toggleDraw] = useState(false);
    const [showUpload, toggleUploadModal] = useState(false);
    const [logged, setLog] = useState(false);
    let view;
    /*
    Netherland fromLonLat([6, 52.5]), 7, geojson;
    tamilnadu = fromLonLat([78.6569, 11.1271]), 6.5, geojson;
    */
    const tamilNadu = fromLonLat([78.6569, 11.1271]);
    useEffect(() => {
        if (logged && view)
            view.animate({
                center: tamilNadu,
                zoom: 6.5,
                duration: 2000
            })
        else if(!logged && view)
            view.animate({
                center: [0,0],
                zoom: 0,
                duration: 2000
            })
    }, [logged, view, tamilNadu]);
    const saveView = (v) => view = v;
    return (
        <HashRouter>
            <Header key='header' toggleDraw={toggleDraw} showDraw={showDraw} logged={logged} setLog={setLog} />
            <Draw showDraw={showDraw} toggleDraw={toggleDraw} showUpload={toggleUploadModal} />
            {showUpload && <UploadModal open={showUpload} close={() => toggleUploadModal(false)} />}
            <Switch>
                <Route exact path="/analysis">
                    <Analysis />
                </Route>
                <Route exact path="/">
                    <DrawMap mainType={1} subType={{
                        101: true,
                        102: true
                    }} logged={logged} sendView={saveView} />
                </Route>
                <Route exact path="/results">
                    <Map mainType={1} subType={{
                        101: true,
                        102: true
                    }} logged={logged} sendView={saveView}/>
                </Route>
            </Switch>
        </HashRouter>
    )
}

export default Main;
