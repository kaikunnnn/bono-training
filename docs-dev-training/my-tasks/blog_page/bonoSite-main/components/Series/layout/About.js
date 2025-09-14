// pages/series.js
import React from "react";
import HeadingSeries from "../HeadingSeries";

const About = ({props}) => {
  return (
    <>
      <div className="About">

       <HeadingSeries props={props.whythis}/>

        <div>
          <p className="UiUx self-stretch text-black text-opacity-70 text-lg font-medium font-['Noto Sans'] leading-9 tracking-wide">
            {props.aboutthisseries}
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
