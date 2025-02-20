import { InfinitySpin } from "react-loader-spinner";

export default function Spinner() {
    return (
        <div className="fixed w-screen h-screen left-0 top-0 bg-slate-800/70 z-50">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <InfinitySpin
                    width="200"
                    color="#4fa94d"
                />
            </div>
        </div>
    )
}