import React from 'react';
import CardInvitation from '../ui/hero/Card';
import TitleAbout from '../ui/hero/Title';
import Gradation from '../ui/hero/Garadation';
// framer motion
import { motion } from "framer-motion";


const Hero = () => {
    return (<>
    <div className="Hero w-full bg-neutral-50 flex-col justify-start items-center gap-2.5 inline-flex">
        {/* Title */}
        <TitleAbout></TitleAbout>
        {/* Card */}
        <motion.div className='z-10'
                    initial={{ opacity: 0, y: 320 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, ease: "backInOut" }}
                >
                    <CardInvitation></CardInvitation>
                </motion.div>
        {/* Gradation */}
        <Gradation></Gradation>
    </div>
    </>
    );
}

export default Hero;