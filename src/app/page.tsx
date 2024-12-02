import Head from "next/head";
import CameraFeed from "../components/CameraFeed";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Head>
        <title>Object Recognition App</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">تطبيق وصف الأشياء</h1>
      <CameraFeed />
    </div>
  );
}
