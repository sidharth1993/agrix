import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import { fromLonLat } from 'ol/proj';
import { message } from 'antd';
import Header from './components/header';
import Map from './components/map/Map';
import DrawMap from './components/map/DrawMap';
import Analysis from './components/analysis';
import Draw from './components/draw';
import UploadModal from './components/map/UploadModal';

message.config({
    top: 100,
    maxCount: 1,
    duration:5
});

function Main(props) {
    const [showDraw, toggleDraw] = useState(false);
    const [showUpload, toggleUploadModal] = useState(false);
    const [location, setLocation] = useState({});
    const [logged, setLog] = useState(false);

    const updateLocation = location => {
        setLocation(location)
    };
    return (
        <HashRouter>
            <Header key='header' toggleDraw={toggleDraw} showDraw={showDraw} logged={logged} setLog={setLog} updateLocation={updateLocation}/>
            <Draw showDraw={showDraw} toggleDraw={toggleDraw} showUpload={toggleUploadModal} />
            {showUpload && <UploadModal open={showUpload} close={() => toggleUploadModal(false)} />}
            <Switch>
                <Route exact path="/analysis">
                    <Analysis />
                </Route>
                <Route exact path="/">
                    <DrawMap logged={logged} />
                </Route>
                <Route exact path="/results">
                    <Map mainType={1} subType={{
                        101: true,
                        102: true
                    }} logged={logged} />
                </Route>
            </Switch>
        </HashRouter>
    )
}

export default Main;
