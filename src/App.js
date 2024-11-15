import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const [personCount, setPersonCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para mostrar el spinner

  useEffect(() => {
    // Configura el backend como 'webgl' o 'cpu'
    tf.setBackend('webgl').then(() => {
      startVideoAndLoadModel();
    });
  }, []);

  const startVideoAndLoadModel = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Asegura que el video esté listo antes de cargar el modelo
        videoRef.current.onloadedmetadata = async () => {
          console.log("Video cargado y listo para la detección");
          const model = await cocoSsd.load();
          detectObjects(model);
        };
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const detectObjects = (model) => {
    const detectFrame = async () => {
      // Verifica que el video tenga un ancho y alto válidos
      if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        const predictions = await model.detect(videoRef.current);
        const persons = predictions.filter(pred => pred.class === 'person');
        setPersonCount(persons.length);

        // Oculta el spinner después de la primera detección
        if (isLoading) {
          setIsLoading(false);
        }
      }
      requestAnimationFrame(detectFrame); // Llama nuevamente para el siguiente cuadro
    };

    detectFrame();
  };

  const toggleVideo = () => {
    if (isPaused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  return (
    <div className="App">
      <div className='card text-bg-dark '>
        <div className="card-header">
          Modelo de detección <strong> Coco-SSD</strong>
        </div>
        <div className='container'>
          <video ref={videoRef} autoPlay playsInline muted width="100%" height="100%" />
        </div>
        <div className="card-body">
          <h1 className="card-text">Personas detectadas:{isLoading && (
            <div className="spinner-overlay">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )} {!isLoading? personCount : "" }</h1>
          <hr />

          <div className="accordion accordion-flush" id="accordionFlushExample">
            <div className="accordion-item text-bg-dark">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed text-bg-dark" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                  <h3 className='definition'> Definición Coco-SSD</h3>
                </button>
              </h2>
              <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                <div className="accordion-body">
                  <p>
                    Coco-SSD es un modelo de detección de objetos basado en la arquitectura<br />
                    Single Shot Multibox Detector (SSD) y entrenado en el conjunto de datos COCO<br />
                    (Common Objects in Context). Es un modelo de machine learning usado para<br />
                    identificar y localizar objetos comunes en imágenes en tiempo real.<br /><br />

                    <b>1. Arquitectura SSD:</b><br />
                    SSD (Single Shot Multibox Detector) es un modelo de detección de objetos<br />
                    que realiza detecciones de una sola vez (single shot), sin tener que pasar<br />
                    por múltiples etapas como en otros modelos (por ejemplo, Faster R-CNN).<br />
                    Esto lo hace más rápido y adecuado para aplicaciones en tiempo real.<br /><br />
                    La arquitectura SSD divide la imagen en una cuadrícula y genera un conjunto<br />
                    de "cajas" o "cuadros delimitadores" que tratan de detectar objetos en varias<br />
                    escalas.<br /><br />

                    <b>2. Conjunto de datos COCO:</b><br />
                    COCO es un conjunto de datos que contiene imágenes de objetos comunes en <br />
                    contextos variados (como personas, animales, vehículos, objetos de la vida diaria,<br />
                    etc.). Contiene más de 300,000 imágenes etiquetadas en 80 categorías de objetos.<br /><br />
                    El modelo Coco-SSD se entrena con este conjunto de datos, por lo que puede<br />
                    reconocer y detectar estos 80 tipos de objetos.<br /><br />

                    <b>3. Detección en tiempo real:</b><br />
                    Coco-SSD es popular para aplicaciones en tiempo real porque su arquitectura<br />
                    SSD permite realizar detecciones rápidamente, lo cual es útil para videos<br />
                    en vivo o imágenes continuas.<br /><br />
                    Se puede usar en aplicaciones como cámaras de seguridad, análisis en video <br />
                    en tiempo real, o proyectos de visión por computadora.<br /><br />

                    <b>4. Implementación:</b><br />
                    En JavaScript, TensorFlow.js ofrece una implementación de Coco-SSD que permite<br />
                    realizar detección de objetos en el navegador, usando la cámara de un dispositivo<br />
                    o procesando imágenes directamente.<br /><br />
                    También existen implementaciones en otros lenguajes y frameworks de deep learning<br />
                    como TensorFlow y PyTorch.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <button className="btn btn-primary" onClick={toggleVideo}>
            {isPaused ? "Reanudar Video" : "Pausar Video"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;