
function ListMovie({props}) {
  return (<>
   <div className="ListContent self-stretch px-5 py-2 justify-start items-center gap-2.5 inline-flex">
                    <div className=" Thumnail bg-gray-400 w-24 h-14 rounded flex-col justify-start items-start gap-2.5 inline-flex">
                      <div className="Count px-1 py-0.5 bg-black bg-opacity-60 rounded justify-center items-center gap-2.5 inline-flex">
                        <div className="21 text-center   text-xs font-bold font-['SF Pro Text'] leading-3">  
                            <span>12:21</span>
                        </div>
                      </div>
                    </div>
                    <div className="Text grow shrink basis-0 flex-col justify-start items-start inline-flex">
                      <div className=" self-stretch  text-xs font-semibold font-['Hiragino Kaku Gothic Pro'] leading-tight tracking-wide">
                        <h3>目的の達成に必要な要素を洗い出そう</h3>
                      </div>
                    </div>
    </div>
  </>
  );
}

export default ListMovie;
