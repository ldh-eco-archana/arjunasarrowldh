declare module 'pdfjs-dist/build/pdf' {
  const getDocument: any;
  const GlobalWorkerOptions: {
    workerSrc: string;
  };
  const version: string;
  export { getDocument, GlobalWorkerOptions, version };
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const worker: any;
  export default worker;
} 