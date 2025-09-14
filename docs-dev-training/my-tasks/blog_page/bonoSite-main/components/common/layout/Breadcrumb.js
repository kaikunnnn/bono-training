import Link from 'next/link';

const Breadcrumbs = ({ crumbs }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex leading-none divide-x divide-gray-200">
        {crumbs.map((crumb, i) => (
          <li key={i} className={`${i === 0 ? 'pr-2' : 'px-2'}`}>
            <Link href={crumb.href}>
              <p className='text-xxs md:text-xs underline text-gray-400 hover:no-underline'>{crumb.title}</p>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;