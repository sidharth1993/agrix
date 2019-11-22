import React, { useState } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
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
    const [logged, setLog] = useState(false);

    return (
        <HashRouter>
            <Header key='header' toggleDraw={toggleDraw} showDraw={showDraw} logged={logged} setLog={setLog}/>
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
                    <Map logged={true} />
                </Route>
            </Switch>
        </HashRouter>
    )
}

export default Main;
