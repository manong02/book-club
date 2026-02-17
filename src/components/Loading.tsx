import Lottie from "lottie-react";
import readingBook from "../assets/ReadingBook.json";

export default function Loading() {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
            <div className="w-50 h-50 -mt-16">
                <Lottie 
                    animationData={readingBook}
                    loop={true}
                    className="w-full h-full"
                />
            </div>
        </div>
    )
}