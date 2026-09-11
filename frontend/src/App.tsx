import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {Greet} from "../wailsjs/go/main/App";
import {ListDockerImages} from "../wailsjs/go/main/DockerCommandBindings";
import { docker_commands } from '../wailsjs/go/models';

function App() {
    const [dockerImages, setDockerImages] = useState<docker_commands.DockerImage[]>([]);

    async function listDockerImages() {
        ListDockerImages()
            .then(output => {
                setDockerImages(output);
            })
            .catch(err => console.error(err));
    
    }

    return (
        <div id="App">
            <div id="input" className="input-box">
                <button className="btn" onClick={listDockerImages}>List Docker Images</button>
            </div>
            <div id="result" className="result">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>ID</th>
                            <th>Disk Usage</th>
                            <th>Content Size</th>
                            <th>Extra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dockerImages.map((image, index) => (
                            <tr key={index}>
                                <td>{image.Image}</td>
                                <td>{image.ID}</td>
                                <td>{image.DiskUsage}</td>
                                <td>{image.ContentSize}</td>
                                <td>{image.Extra}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default App
