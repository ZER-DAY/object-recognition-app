"use client";

import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);

  useEffect(() => {
    let model: cocoSsd.ObjectDetection;

    // تحميل النموذج
    const loadModel = async () => {
      model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      console.log("Model loaded!");
    };

    // وظيفة التحدث النصي
    const speak = (text: string) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    };

    // وظيفة الكشف عن الكائنات
    const detectObjects = () => {
      if (videoRef.current && canvasRef.current && model) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // الكشف عن الكائنات باستخدام النموذج
          model.detect(video).then((predictions) => {
            // تصفية الكائنات التي تحتوي على دقة أكبر من 60%
            const filteredPredictions = predictions.filter(
              (p) => p.score && p.score > 0.6
            );

            // تحديث الحالة لعرض الكائنات المكتشفة
            setDetectedObjects(filteredPredictions);

            filteredPredictions.forEach((prediction) => {
              context.strokeStyle = "red";
              context.lineWidth = 2;
              context.strokeRect(
                prediction.bbox[0],
                prediction.bbox[1],
                prediction.bbox[2],
                prediction.bbox[3]
              );

              context.fillStyle = "red";
              context.fillText(
                `${prediction.class} (${(prediction.score! * 100).toFixed(
                  1
                )}%)`,
                prediction.bbox[0],
                prediction.bbox[1] - 5
              );

              // نطق الكائن المكتشف
              speak(`تم التعرف على ${prediction.class}`);
            });
          });
        }
      }
    };

    // الوصول إلى الكاميرا
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          // التحديث كل نصف ثانية
          setInterval(detectObjects, 500);
        }
      })
      .catch((err) => console.error("Error accessing camera:", err));

    // تحميل النموذج عند بداية الاستخدام
    loadModel();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">تطبيق وصف الأشياء</h1>
      <div className="relative w-full max-w-4xl aspect-video">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          autoPlay
        />
        <canvas ref={canvasRef} className="absolute w-full h-full" />
      </div>
      <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">الأشياء المكتشفة:</h2>
        {detectedObjects.length > 0 ? (
          <ul className="list-disc list-inside">
            {detectedObjects.map((obj, index) => (
              <li key={index} className="text-lg">
                {obj.class} - دقة: {(obj.score! * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">لم يتم التعرف على أي شيء بعد...</p>
        )}
      </div>
    </div>
  );
};

export default CameraFeed;
