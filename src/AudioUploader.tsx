import { useState, useCallback } from "react";
import { useDropzone, FileRejection,  } from "react-dropzone";
import { HiArrowUpTray, HiMiniCheck, HiXMark } from "react-icons/hi2";

interface AudioFile extends File {
    preview: string;
}

const AudioUploader = ({className, sizeLimit, audioLoadedCallback}:{className?:string, sizeLimit?:number, audioLoadedCallback?: (title: string, audioUrl: string, lrc: string) => void}) => {
    const [audioFile, setAudioFile] = useState<AudioFile[]>([]);
    const [lrcFile, setLrcFile] = useState<AudioFile[]>([]);
    const [rejected, setRejected] = useState<FileRejection[]>([]);

    const onDrop = useCallback(<AudioFile extends File>(acceptedFiles : AudioFile[] , rejectedFiles : FileRejection[] ) => {
        if (acceptedFiles?.length) {
            if (acceptedFiles[0].type === '' || acceptedFiles[0].type === 'text/plain') {
                acceptedFiles.forEach(file => {
                    try {
                        file.text().then((text) => {
                            setLrcFile([
                                ...acceptedFiles.map((file) =>
                                    Object.assign(file, { preview: text })
                                )]);
                        });
                    } catch (error) {
                        console.log(error);
                    }
                });
            } else {
                setAudioFile([
                    ...acceptedFiles.map((file) =>
                        Object.assign(file, { preview: URL.createObjectURL(file) })
                    ),
                ]);
            }
        }

        if (rejectedFiles?.length) {
            setRejected([...rejectedFiles]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'audio/*': [],
            'text/plain': ['.lrc', '.txt'],
        },
        maxSize: (sizeLimit??10) * 1024 * 1000,
        onDrop,
        multiple: false
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submit");

        if (!audioFile?.length) return;
        if (!lrcFile?.length) return;

        const processedLrc = lrcFile[0].preview.split("[00:00.00]")[1];
        if (!processedLrc) return;
        
        audioLoadedCallback?.(audioFile[0].name.slice(0, audioFile[0].name.lastIndexOf('.')),  audioFile[0].preview, processedLrc.split("\n", 1)[0].trim() === "" ? "\n[00:00.00]♫" + processedLrc : "\n[00:00.00]" + processedLrc);
    };

    const removeFile = (name: string, type: string) => {
        type === "text/plain" || type === "" ? (lrcFile?.length && lrcFile[0].name === name ? setLrcFile([]) : null) : (audioFile?.length && audioFile[0].name === name ? setAudioFile([]) : null);
    };

    const removeRejected = (name: string) => {
        setRejected((files) => files.filter(({ file } : FileRejection) => file.name !== name));
    };

    return (
        <>
            <h1 className='title text-[1.6rem]/8 font-semibold'>Upload Audio & LRC</h1>
            <form onSubmit={handleSubmit}>
                <div
                    {...getRootProps({
                        className: className,
                    })}
                >
                    <input {...getInputProps()} />
                    <div className='flex flex-col items-center justify-between'>
                        <HiArrowUpTray className='w-5 h-5 fill-current' />
                        {isDragActive ? (
                            <p>Drop the files here ...</p>
                        ) : (
                            <p>Drag & drop files here, or click to select files</p>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <section className='mt-4 grow-0'>
                    <div className='flex gap-4 h-9'>
                        <button
                            type='submit'
                            className='ml-auto mt-0 text-[12px] uppercase tracking-wider font-bold border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors'
                        >
                            Upload
                        </button>
                    </div>
                    <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                        Audio File 
                    </h3>
                    { audioFile.length > 0 ? 
                    <>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            <li key={"audio-"+audioFile[0].name} className='flex items-center justify-between'>
                                <div>
                                    <p className='mt-1 text-sm font-medium text-left'>
                                    {audioFile[0].name}
                                    </p>
                                </div>
                                <div className='flex flex-row items-center gap-3'> 
                                    <div className='mt-1 text-sm font-medium text-right text-green-300'>
                                        <HiMiniCheck className='w-5 h-5 fill-current' />
                                    </div>
                                    <button
                                        type='button'
                                        className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                        onClick={() => removeFile(audioFile[0].name, audioFile[0].type)}
                                    >
                                        remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </>
                    : 
                    <p className=" text-center italic w-full my-3">No files loaded</p> 
                    }
                    <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                        Lrc File 
                    </h3>
                    { lrcFile.length > 0 ? 
                    <>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            <li key={"lrc-"+lrcFile[0].name} className='flex items-center justify-between'>
                                <div>
                                    <p className='mt-1 text-sm font-medium text-left'>
                                    {lrcFile[0].name}
                                    </p>
                                </div>
                                <div className='flex flex-row items-center gap-3'> 
                                    <div className='mt-1 text-sm font-medium text-right text-green-300'>
                                        <HiMiniCheck className='w-5 h-5 fill-current' />
                                    </div>
                                    <button
                                        type='button'
                                        className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                        onClick={() => removeFile(lrcFile[0].name, lrcFile[0].type)}
                                    >
                                        remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </>
                    : 
                    <p className=" text-center italic w-full my-3">No files loaded</p> 
                    }
                    { rejected.length > 0 ? 
                    <>
                        <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                            Rejected Files 
                        </h3>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            {rejected.map(({ file, errors }, index) => (
                                <li key={file.name+"-"+index} className='flex items-center justify-between'>
                                    <div>
                                        <p className='mt-1 text-sm font-medium text-left'>
                                            {file.name}
                                        </p>
                                        <ul className='text-[12px] opacity-60'>
                                            {errors.map(error => (
                                                <li key={error.code}>{error.code === "file-too-large" ? "File size exceeds "+(sizeLimit??1)+"MB limit":error.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='mt-1 text-sm font-medium text-right text-red-500'>
                                            <HiXMark className='w-5 h-5 fill-current' />
                                        </div>
                                        <button
                                            type='button'
                                            className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                            onClick={() => removeRejected(file.name)}
                                        >
                                            remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                    : null }
                </section>
            </form>
        </>
    )
}

export default AudioUploader;