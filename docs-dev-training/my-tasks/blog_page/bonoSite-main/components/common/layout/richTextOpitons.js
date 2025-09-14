 // richTextOptions.js
import React from 'react';

export const options = {
  renderNode: {
    'document': (node, children) => <div className="text-base leading-relaxed">{children}</div>,
    'heading-1': (node, children) => <h1 className="text-4xl text-center font-bold my-4 leading-tight mt-20">{children}</h1>,
    'heading-2': (node, children) => <h2 className="text-3xl font-semibold my-3 leading-snug mt-20">{children}</h2>,
    'heading-3': (node, children) => <h3 className="text-2xl font-bold my-2 leading-snug mt-12">{children}</h3>,
    'heading-4': (node, children) => <h4 className="text-lg font-medium my-2">{children}</h4>,
    'heading-5': (node, children) => <h5 className="text-base font-medium my-2">{children}</h5>,
    'paragraph': (node, children) => <p className="text-lg my-2 leading-loose mt-8">{children}</p>,
    'hyperlink': (node, children) => <a href={node.data.uri} className="text-blue-500 underline hover:text-blue-700">{children}</a>,
    'bold': (node, children) => <span className="font-bold">{children}</span>,
    'italic': (node, children) => <span className="italic">{children}</span>,
    'unordered-list': (node, children) => <ul className="list-disc pl-5">{children}</ul>,
    'ordered-list': (node, children) => <ol className="list-decimal pl-5">{children}</ol>,
    'list-item': (node, children) => <li className="my-1">{children}</li>,
    'blockquote': (node, children) => <blockquote className="border-l-4 border-gray-400 pl-4 italic">{children}</blockquote>,
    'code': (node, children) => <pre className="bg-gray-200 p-3 rounded"><code>{children}</code></pre>,

  },
};