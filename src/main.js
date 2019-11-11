import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Header from './components/header';
import Map from './components/map/Map';
import Analysis from './components/analysis';
import Draw from './components/draw';
import UploadModal from './components/map/UploadModal';

function Main() {
    const [showDraw, toggleDraw] = useState(false);
    const [showUpload, toggleUploadModal] = useState(false);

    return (
        <BrowserRouter>
            <Header key='header' toggleDraw={toggleDraw} showDraw={showDraw}/>
            <Draw showDraw={showDraw}  toggleDraw={toggleDraw} showUpload={toggleUploadModal}/>
            {showUpload && <UploadModal open={showUpload} close={()=>toggleUploadModal(false)}/>}
            <Switch>
                <Route exact path="/">
                    <Map mainType={1} subType={{
                        101: true,
                        102: true
                    }} />
                </Route>
                <Route exact path="/analysis">
                    <Analysis/>
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

export default Main;
