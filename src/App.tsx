import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { LyrixCard } from 'lyr-ix'
// import { lyrics } from './assets/mural'
import { breakdownContentType } from './assets/breakdown';
import { BiLogoGithub } from "react-icons/bi";
import { HiChevronRight, HiChevronLeft, HiOutlineMusicalNote, HiListBullet, HiMiniCheck, HiOutlinePhoto, HiOutlineSquaresPlus } from "react-icons/hi2";
import ImageUploader from './ImageUploader';
import AudioUploader from './AudioUploader';
import BreakdownUploader from './BreakdownUploader';

import './App.css'

// const allImages =  Object.keys(breakdownContent).map((key) => breakdownContent[parseInt(key)].image).flat().filter((img) => img !== undefined) as string[];
// const imageObject = allImages.reduce((obj, img) => {
//   obj[img] = img;
//   return obj;
// }, {} as {[key: string]: string});

const appBackgroundColor = "#5c6677"; //#555c68

const HeaderBar = ({logoSrc, appName, homeUrl="", className, style, centerStyle, children}:{logoSrc: string, appName: string, className?: string, homeUrl?: string, style?: React.CSSProperties, centerStyle?: React.CSSProperties, children?: React.ReactNode}) => {

  return (
    <div className={'w-full absolute top-0 left-0 h-11 bg-black/[0.03] flex flex-row items-center z-50 ' + className} style={style}>
        <a className='header-left flex flex-row items-center gap-3 ml-4 opacity-70 hover:opacity-95' href={homeUrl} >
          <img src={logoSrc} className='h-6' />
          <div className='header-title text-xl text-white/90 mb-1'>{appName}</div>
        </a>
        <div className='header-center flex flex-row items-center gap-2 flex-1 justify-center opacity-70' style={centerStyle}>
          {children}
        </div>
        <div className='header-right flex flex-row items-center gap-3 mr-4'>
          <a href='https://github.com/bouzidanas/lyr-ix' target='_blank' rel='noreferrer'>
            <BiLogoGithub className='text-white/65 hover:text-white/85 h-6 w-6' />
          </a>
        </div>
      </div>
  )
}

const LyrixCardMemo = memo(LyrixCard);
  
const BackgroundMemo = memo(({backgroundRef, initialColor="none"}: {backgroundRef: React.RefObject<HTMLDivElement>, initialColor?: string}) => {
  return (
    <div 
      key={"bg-div"} 
      ref={backgroundRef}
      className="app-background absolute top-0 left-0 w-full h-full z-[-1]"
      style={{transition: "background-color 0.5s ease-in-out 0.2s", backgroundColor: initialColor}}
    />
  )
});

const Image = ({src, className}: {src: string, className?: string}) => {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
      let timer1 = setTimeout(() => {
        if (loaded) imageRef.current!.parentElement!.style.left = "0";
      }, 200);

      return () => {
        clearTimeout(timer1);
      };
    },[loaded]);

  return (
    <div className={'img-cont flex justify-center items-center w-full rounded-2xl overflow-hidden shadow-xl transition-all ease-in-out duration-700 delay-100 relative left-[100vw] h-full hover:h-[170%] ' + className}>
      <img ref={imageRef} src={src} style={{ minWidth: "100%", minHeight: "100%", objectFit: "cover" }} onLoad={() => setLoaded(true)} />
    </div>
  )
}

const Text = ({md, className}: {md: string, className?: string}) => {
  const textRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => {
      let timer1 = setTimeout(() => {
        textRef.current!.style.opacity = "1";
      }, 200);
      return () => {
        clearTimeout(timer1);
      };
    },[]);

  return (
    <div ref={textRef} className={'md-cont flex flex-1 justify-center items-center w-full transition-all ease-in-out duration-300 opacity-0 max-h-[101%] ' + className} style={{WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 97%, rgba(0, 0, 0, 0))', maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 97%, rgba(0, 0, 0, 0))' }} >
      <div className=' max-h-full overflow-y-scroll py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color:var(--text-color)] '>
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className='md-inner text-2xl text-left p-4'>{md}</Markdown>
      </div>
    </div>
  )
}

interface LyrixBreakdownProps {
  trackTitle: string;
  audioSrc: string;
  lrc: string;
  breakdown: breakdownContentType;
  bgRef: React.RefObject<HTMLDivElement>;
  images: {[key: string]: string}
  muted?: boolean;
} 

const LyrixBreakdown = ({trackTitle, audioSrc, lrc, breakdown, bgRef, images, muted}: LyrixBreakdownProps) => {
  const [index, setIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const keyChangeCount = useRef(0);

  console.log("render breakdown");

  const currKey = useMemo(() => {
    console.log("key change");
    keyChangeCount.current++;
    return keyChangeCount.current;
  }, [lrc, audioSrc]);

  const handleOnLineChange = (line: number) => {
    const keys = Object.keys(breakdown).map((key) => parseInt(key)).filter((key) => key <= line);
    const maxKey = Math.max(...keys);
    if (maxKey !== -Infinity && maxKey !== index) {
      setIndex(maxKey);
    }
  }

  useEffect(() => {
    if (breakdown[index].color) bgRef.current!.style.backgroundColor = breakdown[index].color!;
  }, [index])

  return (
    <> 
      <div className="app flex flex-row justify-center items-center w-screen h-screen gap-20 overflow-hidden" >
        <LyrixCardMemo
          key={"LyrixCardMemo_" + currKey}
          className='lyr-ix backdrop-blur-[40px] max-w-[32rem]'
          title={trackTitle}
          src={audioSrc}
          lyricsScale={0.9}
          controlsScale={0.9}
          lrc={lrc}
          mute={muted}
          onLineChange={handleOnLineChange}
        />
        <div ref={contentRef} className='flex flex-col justify-center items-center flex-1 max-w-2xl min-w-[19rem] h-full max-h-[calc(62vh+10.8rem)] gap-5'>
          {
            breakdown[index].mBelow ?
              breakdown[index].markdown?.map((md, i) => (
                <Text key={'md-' + index + '-' + i} md={md} />
              )) ?? null
              :
              breakdown[index].image?.map((img, i) => (
                <Image key={'img-' + index + '-' + i} src={images[img]} />
              )) ?? null
          } 
          {
            breakdown[index].mBelow ?
              breakdown[index].image?.map((img, i) => (
                <Image key={'img-' + index + '-' + i} src={images[img]} />
              )) ?? null
              :
              breakdown[index].markdown?.map((md, i) => (
                <Text key={'md-' + index + '-' + i} md={md} />
              )) ?? null
          }
        </div>
      </div>
    </>
  )
}

type slideType = {
  type : "left" | "right" | "none";
}

export type imageSrcsType = {
  [key: string]: string;
}

function App() {
  const [pagePos, setPagePos] = useState<"left" | "center" | "right">("left");
  const [pageTransition, setPageTransition] = useState<"none" | "all 0.7s ease-in-out">("none");
  const [slide, setSlide] = useState<slideType>({type:"none"}); // use object to ensure that every call of the setter causes a re-render and the slide-dependent useEffect is called
  const [imageSources, setImageSources] = useState<imageSrcsType>({});
  const [audioSources, setAudioSources] = useState<{title: string, audio: string, lrc: string}>({title: "", audio: "", lrc: ""});
  const [breakdownContent, setBreakdownContent] = useState<breakdownContentType>({0:{}});
  const backgroundRef = useRef<HTMLDivElement>(null);
  const pageSliderRef = useRef<HTMLDivElement>(null);
  const firstSlideRight = useRef(true);

  console.log("render app");

  // useEffect(() => {
  //   console.log(window.location.search)
  //   window.history.replaceState(null, "", window.location.pathname + "#left");
  //   console.log("history state: ", window.history.state);
  // }, []);

  useEffect(() => {
    if (pagePos === "left") {
      pageSliderRef.current!.style.left = "0";
      // backgroundRef.current!.style.backgroundColor = appBackgroundColor;
    }
    else if (pagePos === "center") {
      pageSliderRef.current!.style.left = "-100vw";
      if (firstSlideRight!.current && breakdownContent[0].color) {
        backgroundRef.current!.style.backgroundColor = breakdownContent[0].color!;
        firstSlideRight.current = false;
      }
    }
    else if (pagePos === "right") {
      pageSliderRef.current!.style.left = "-200vw";
    }
  }, [pagePos])


  useEffect(() => {
    setPageTransition("all 0.7s ease-in-out");
    const pos = pagePos === "center" ? (slide.type === "left" ? "left" : (slide.type === "right" ? "center" : "center")) : (pagePos === "left" ? (slide.type === "left" || slide.type === "none" ? "left" : "center") : (slide.type === "left" ? "center" : "right"))
    let timer1 = setTimeout(() => {
      setPagePos(pos);
    }, 300);
    let timer2 = setTimeout(() => {
      setPageTransition("none");
    }, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [slide]);

  const handleButtonClick = (type: "left" | "right") => {
    setSlide({type:type});
  }

  // // test slider
  // useEffect(() => {
  //   let timer1 = setTimeout(() => {
  //     setSlide({type:"right"});
  //   }, 2000);
  //   let timer2 = setTimeout(() => {
  //     setSlide({type:"left"});
  //   }, 5000);
  //   let timer3 = setTimeout(() => {
  //     setSlide({type:"left"});
  //   }, 8000);
  //   let timer4 = setTimeout(() => {
  //     setSlide({type:"right"});
  //   }, 11000);

  //   return () => {
  //     clearTimeout(timer1);
  //     clearTimeout(timer2);
  //     clearTimeout(timer3);
  //     clearTimeout(timer4);
  //   };
  // }, []);

  const imagesLoaded = (imageSrcs : {[key: string]: string}) => {
    setImageSources(imageSrcs);
  }

  const audioLoaded = (title : string, audioSrc : string, lrc : string) => {
    setAudioSources({title: title, audio: audioSrc, lrc: lrc});
  }

  const breakdownLoaded = (breakdown : breakdownContentType) => {
    setBreakdownContent(breakdown);
  }

  return (
    <>
      <HeaderBar logoSrc="/n-logo-t.svg" appName="Lyrix" />
      <BackgroundMemo 
        backgroundRef={backgroundRef}
        initialColor={appBackgroundColor}
      />  
      {pagePos !== "left" ? 
        <button className='slide-left-button flex justify-end gap-2 absolute rounded-md bottom-0 w-fit left-0 pl-3 pr-4 mt-4 transform -translate-y-1/2 z-50 opacity-80 hover:opacity-100 bg-black/5 transition-all duration-500 ease-in-out [&:hover>.prev-arrow]:pr-5' onClick={() => handleButtonClick("left")}>
          <div className='prev-arrow flex justify-end items-start w-12 pr-1 my-3' style={{transition: "padding 600ms ease-in-out"}}>
            <HiChevronLeft className='h-7 w-6' />
          </div>
          <div className='flex justify-center items-start my-3' data-tooltip='upload files'>
            <HiOutlineSquaresPlus className='h-7 w-6' />
          </div>
        </button> : null}
      {pagePos === "left" ? 
        <button className='slide-right-button flex justify-start gap-2 absolute rounded-md bottom-0 w-fit right-0 pl-4 pr-3 mt-4 transform -translate-y-1/2 z-50 opacity-80 hover:opacity-100 bg-black/5 transition-all duration-500 ease-in-out [&:hover>.next-arrow]:pl-5' onClick={audioSources.title !== "" && audioSources.audio !== "" && audioSources.lrc !== "" && !(Object.keys(breakdownContent).length === 1 && Object.keys(breakdownContent[0]).length === 0)? () => handleButtonClick("right") : undefined}>
          { pagePos === "left" ?
            <>
              { Object.keys(imageSources).length > 0 ?
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='images have loaded'>
                  <HiOutlinePhoto className='h-7 w-6 text-green-300' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-green-300' />
                </div>
              :
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='images have not been loaded'>
                  <HiOutlinePhoto className='h-7 w-6' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-white opacity-20' />
                </div>
              }
              { audioSources.title !== "" && audioSources.audio !== "" && audioSources.lrc !== "" ? 
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='audio & lrc files have loaded'>
                  <HiOutlineMusicalNote className='h-7 w-6 text-green-300' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-green-300' />
                </div>
              :
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='audio/lrc files have not been loaded'>
                  <HiOutlineMusicalNote className='h-7 w-6' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-white opacity-20' />
                </div>
              }
              { Object.keys(breakdownContent).length === 1 && Object.keys(breakdownContent[0]).length === 0? 
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='breakdown file has not been loaded'>
                  <HiListBullet className='h-7 w-7' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-white opacity-20' />
                </div>
              :
                <div className='flex justify-center items-start gap-0 my-3' data-tooltip='breakdown file has loaded'>
                  <HiListBullet className='h-7 w-7 text-green-300' />
                  <HiMiniCheck key='audio-uploaded' className='h-5 w-5 ml-[-4px] text-green-300' />
                </div>
              }
            </>
          : null }
          {audioSources.title !== "" && audioSources.audio !== "" && audioSources.lrc !== "" && !(Object.keys(breakdownContent).length === 1 && Object.keys(breakdownContent[0]).length === 0)?
            <div className='next-arrow flex justify-left items-start w-12 pl-1 my-3' style={{transition: "padding 600ms ease-in-out"}}>
              <HiChevronRight className=' h-7 w-7' />
            </div>
          : 
            <div className='next-arrow flex justify-left items-start w-12 pl-1 my-3' style={{visibility: "hidden"}}>
              <HiChevronRight className=' h-7 w-7' />
            </div>
          }
      </button> : null}
      <div className='absolute w-full h-full left-0 top-0 overflow-hidden'>
        <div ref={pageSliderRef} className='page-slider absolute w-[300vw] h-full top-0 flex flex-row ' style={{transition: pageTransition, left: pagePos === "center" ? "-100vw" : pagePos === "left" ? "0" : "-200vw"}}>
          <div className='form-page w-[100vw] h-full flex flex-row justify-center items-center pt-11'>
            <div className='page-content w-fit h-fit flex flex-row justify-center items-center gap-8 lg:gap-16 overflow-y-auto scrollbar-none pb-16 pt-5 px-8 scale-[0.85] 2xl:scale-100'>
              <div className='img-loader-cont rounded-2xl bg-black/5 shadow-xl flex flex-col justify-left items-center py-6 px-10 mt-9 max-w-full w-[32rem] max-h-[calc(100vh-3.5rem)] h-fit min-h-[39rem] [&>form]:max-w-full [&>form]:w-full [&>form]:h-full [&>form]:flex [&>form]:flex-col [&>form]:items-align [&>form]:overflow-y-auto [&>form]:px-4 [&>form]:pb-1 [&>form]:!scrollbar-none'>
                <ImageUploader imagesLoadedCallback={imagesLoaded} sizeLimit={1.9} className=' flex flex-col grow justify-center items-center mt-6 outline-dotted outline-2 mx-[2px] bg-white/5 min-h-[19vh] h-[34vh]' />
              </div>
              <div className='audio-lrc-cont flex flex-col justify-center items-center gap-6 mt-9 max-h-[76vh] min-h-[39rem] max-w-[40vw] w-[32rem]'>
                <div key="audio1-cont" className='audio-loader-cont rounded-2xl bg-black/5 shadow-xl flex flex-col justify-left items-center px-10 py-6 max-w-full w-[32rem] max-h-[45.5vh] h-[45.5vh] min-h-[22.7rem] [&>form]:max-w-full [&>form]:w-full [&>form]:h-full [&>form]:flex [&>form]:flex-col [&>form]:items-align [&>form]:overflow-y-auto [&>form]:px-4 [&>form]:pb-0 [&>form]:!scrollbar-none'>
                  <AudioUploader audioLoadedCallback={audioLoaded} key='audio1' className=' flex flex-col grow justify-center items-center mt-6 outline-dotted outline-2 mx-[2px] bg-white/5 min-h-[7vh] h-[16.4vh]' />
                </div>
                <div key='bkdn-cont' className='bkdn-loader-cont rounded-2xl bg-black/5 shadow-xl flex flex-col justify-left items-center px-10 py-6 max-w-full w-[32rem] max-h-[30vh] h-[30vh] min-h-[18rem] [&>form]:max-w-full [&>form]:w-full [&>form]:h-full [&>form]:flex [&>form]:flex-col [&>form]:items-align [&>form]:overflow-y-auto [&>form]:px-4 [&>form]:pb-1 [&>form]:!scrollbar-none'>
                  <BreakdownUploader breakdownLoadedCallback={breakdownLoaded} key='bkdn' className=' flex flex-col grow justify-center items-center mt-6 outline-dotted outline-2 mx-[2px] bg-white/5 min-h-[7vh] h-[16.4vh]' />
                </div>
              </div>
            </div>
          </div>
          <div className='breakdown-page w-[100vw] h-full'>
              <LyrixBreakdown 
                trackTitle={audioSources.title}
                audioSrc={audioSources.audio}
                lrc={audioSources.lrc}
                muted={false}
                breakdown={breakdownContent}
                bgRef={backgroundRef}
                images={imageSources}
              />
          </div>
          <div className='final-page w-[100vw] h-full'>

          </div>
        </div>
      </div>
    </>
  )
}

export default App