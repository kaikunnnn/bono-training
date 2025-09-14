
import Link from 'next/link'
import styles from './bonolink.module.css'

function Blockbonolink() {
  return (
    <div className='cursor-pointer m-auto w-full flex justify-center'>
     <Link href="https://bo-no.design/" >
      <div className={`md:max-w-4xl md:w-full w-11/12 m-auto ${styles['blockbonolink']} md:py-20 md:px-20  py-10 px-8 hover:opacity-90`}>
        <div className={` m-auto ${styles['frame484']}`}>
          <div className={`text-white m-auto ${styles['frame483']}`}>
            <span
              className={`text-white ${styles['text']} ${styles['j-p-button-medium']} `}
            >
              <span className='font-bold'>デザインが学べる場を作ってます</span>
            </span>
            <span
              className={`block font-bold ${styles['text2']} ${styles['j-p-head-h4']} `}
            >
              <h3 className='md:text-2xl text-2xl leading-relaxed '>現場のプロに聞いて学べるデザインを高める場所</h3>
            </span>
            <span
              className={`md:text-lg text-base `}
            >
              <p className='leading-loose'>
                現場での実践を意識したナレッジと実践解説動画、未経験からUI/UXデザイナーを目指せるロードマップもご用意。コミュニティで質問もあるから安心。詳細はバナーをクリックしてご覧ください。
              </p>
            </span>
          </div>
          <div className={`m-auto block ${styles['frame482']}`}>
            <img
              src="https://aheioqhobo.cloudimg.io/v7/_playground-bucket-v2.teleporthq.io_/1a3c9e9e-99f8-4850-ae8a-3f25629d72b4/d8c15348-b779-4a2b-aefa-c78ef37f53ab?org_if_sml=1104259"
              alt="image323272"
              className={`${styles['image32']}`}
            />
          </div>
        </div>
      </div>
      </Link>
    </div>
  )
}


export default Blockbonolink