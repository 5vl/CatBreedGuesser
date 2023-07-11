'use client'
import Image from "next/image";
import {useEffect, useState} from "react";
import {Breed, TheCatAPI} from "@thatapicompany/thecatapi";

export default function Page() {
    const [html, setHtml] = useState(<div>Loading...</div>);
    const [apiKey, setApiKey] = useState("");
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [currentImage, setCurrentImage] = useState("/loading.gif");
    const [currentBreed, setCurrentBreed] = useState(Breed.AEGEAN);
    const [randomBreeds, setRandomBreeds]: [randomBreeds: Breed[], setRandomBreeds: any] = useState([]);
    const [api, setApi] = useState(new TheCatAPI(""));

    useEffect(() => {
        if (window.localStorage.getItem("apiKey") !== null && window.localStorage.getItem("apiKey") !== undefined) {
            setApiKey(window.localStorage.getItem("apiKey") as string)
        } else {
            setApiKeyUi()
        }
    }, []);

    useEffect(() => {
        if (apiKey === "") {
            return
        }
        setMessage("")
        setApi(new TheCatAPI(apiKey))
    }, [apiKey])

    useEffect(() => {
        if (apiKey === "") {
            return
        }
        async function check() {
            try {
                const img= await api.images.searchImages({
                    limit: 1,
                    hasBreeds: true,
                    mimeTypes: ["jpg", "png"],
                })
                if (img[0].breeds === undefined) {
                    window.localStorage.removeItem("apiKey")
                    setError("API key error!")
                    return false
                }
                return true
            } catch (e) {
                console.error(e)
                window.localStorage.removeItem("apiKey")
                setError("API key error!")
                return false
            }
        }
        check().then((canContinue) => {
            if (!canContinue) {
                return
            }
            setNewImage()
        })
    }, [api])

    useEffect(() => {
        if (apiKey === "") {
            return
        }
        if (currentImage === "") return
        getRandomBreeds()
    }, [currentImage])

    useEffect(() => {
        if (apiKey === "") {
            return
        }
        if (randomBreeds.length === 0) return
        setGameUi()
    }, [randomBreeds])

    async function setNewImage() {
        try {
            const img= await api.images.searchImages({
                limit: 1,
                hasBreeds: true,
                mimeTypes: ["jpg", "png"],
            })
            if (img[0].breeds === undefined) {
                window.localStorage.removeItem("apiKey")
                setMessage("Error!")
                return
            }
            setCurrentBreed(img[0].breeds[0].id)
            setCurrentImage(img[0].url)
        } catch (e) {
            console.error(e)
            window.localStorage.removeItem("apiKey")
            setMessage("API key error!")
        }
    }

    useEffect(() => {
        if (error == "API key error!") setApiKeyUi()
    }, [error])

    function setApiKeyUi() {
        setHtml(
            <div>
                <div className="flex justify-center">
                    <form className="mt-5" onSubmit={(e) => {
                        e.preventDefault()
                        // @ts-ignore
                        const val = e.target[0].value
                        window.localStorage.setItem("apiKey", val)
                        setApiKey(val)
                    }}>
                        <input className="p-1 rounded text-black" type="text" placeholder="API Key"></input>
                        <button className="p-1 rounded bg-gray-700 ml-2">Set</button>
                    </form>
                </div>
                <p className="flex justify-center mt-3">{error}</p>
                <p className="flex justify-center mt-3">Please set your own TheCatAPI key.</p>
                <p className="flex justify-center">You can get one completely for free <a href="https://thecatapi.com/signup" className="underline ml-1">here</a>.</p>
            </div>
        )
    }

    function setGameUi() {
        setHtml(<div>
            <div className="flex justify-center mt-5">
                {
                    randomBreeds.map((breed, i) => {
                        return <button className="mr-5 p-1 bg-gray-700 rounded" key={i} onClick={() => checkAnswer(breed)}>{ Object.keys(Breed)[Object.values(Breed).indexOf(breed)].toLowerCase().replaceAll("_", " ").replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase()) }</button>
                    })
                }
            </div>
            <div className="flex justify-center mt-3">
                <h1>Score: {score}</h1>
            </div>
            <div className="flex justify-center mt-1">
                <h1>{message}</h1>
            </div>
            <div className="flex justify-center mt-3">
                <Image src={currentImage} alt="" width="600" height="600"></Image>
            </div>
            <div className="flex justify-center">
                <button className="p-1 rounded bg-gray-700 mt-4" onClick={() => {
                    window.localStorage.removeItem("apiKey")
                    setMessage("")
                    setApiKey("")
                    setApiKeyUi()
                }}>Remove API key</button>
            </div>
        </div>)
    }

    function shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getRandomBreeds() {
        let keys= Object.values(Breed).filter((breed) => breed !== currentBreed)
        keys = shuffle(keys)
        let items = []
        for (let i = 0; i < 3; i++) {
            items.push(keys[i])
        }
        items.push(currentBreed)
        setRandomBreeds(shuffle(items))
    }

    function checkAnswer(answer: Breed) {
        if (answer === currentBreed) {
            setScore(score + 1)
            setMessage("Correct!")
        } else {
            setScore(0)
            setMessage("Incorrect!")
        }
        setNewImage()
    }

    return html
}
