import React from "react";

const AllSubject = () => {
  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Subject list</h6>
            <p className="card-description">All Subject Here</p>
          </div>
          <a
            href="create-subject.html"
            className="btn b-solid btn-primary-solid"
          >
            Add Subject
          </a>
        </div>
        {/* <!-- Start All Language List Table --> */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
              <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                <tr>
                  <th className="px-3.5 py-4">Subject Name</th>
                  <th className="px-3.5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                <tr className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white">
                  <td className="flex items-center gap-2 px-3.5 py-4">
                    <a
                      href="#"
                      className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                    >
                      <img
                        src="/assets/images/admin/top-course/top-course-1.png"
                        alt="thumb"
                      />
                    </a>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                        02 Apr 2024
                      </p>
                      <h6 className="leading-none text-heading font-bold mb-1.5 line-clamp-1">
                        <a href="#">UI/UX design</a>
                      </h6>
                    </div>
                  </td>
                  <td className="px-3.5 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href="create-subject.html"
                        className="btn-icon btn-primary-icon-light size-7"
                      >
                        <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                      </a>
                      <button
                        className="btn-icon btn-danger-icon-light size-7"
                        data-modal-target="deleteModal"
                        data-modal-toggle="deleteModal"
                      >
                        <i className="ri-delete-bin-line text-danger text-[13px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white">
                  <td className="flex items-center gap-2 px-3.5 py-4">
                    <a
                      href="#"
                      className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                    >
                      <img
                        src="/assets/images/admin/top-course/top-course-2.png"
                        alt="thumb"
                      />
                    </a>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                        12 Mar 2024
                      </p>
                      <h6 className="leading-none text-heading font-bold mb-1.5 line-clamp-1">
                        <a href="#">Physics</a>
                      </h6>
                    </div>
                  </td>
                  <td className="px-3.5 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href="create-subject.html"
                        className="btn-icon btn-primary-icon-light size-7"
                      >
                        <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                      </a>
                      <button
                        className="btn-icon btn-danger-icon-light size-7"
                        data-modal-target="deleteModal"
                        data-modal-toggle="deleteModal"
                      >
                        <i className="ri-delete-bin-line text-danger text-[13px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white">
                  <td className="flex items-center gap-2 px-3.5 py-4">
                    <a
                      href="#"
                      className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                    >
                      <img
                        src="/assets/images/admin/top-course/top-course-3.png"
                        alt="thumb"
                      />
                    </a>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                        25 Mar 2022
                      </p>
                      <h6 className="leading-none text-heading font-bold mb-1.5 line-clamp-1">
                        <a href="#">Basic Programing</a>
                      </h6>
                    </div>
                  </td>
                  <td className="px-3.5 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href="create-subject.html"
                        className="btn-icon btn-primary-icon-light size-7"
                      >
                        <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                      </a>
                      <button
                        className="btn-icon btn-danger-icon-light size-7"
                        data-modal-target="deleteModal"
                        data-modal-toggle="deleteModal"
                      >
                        <i className="ri-delete-bin-line text-danger text-[13px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white">
                  <td className="flex items-center gap-2 px-3.5 py-4">
                    <a
                      href="#"
                      className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                    >
                      <img
                        src="/assets/images/admin/top-course/top-course-4.png"
                        alt="thumb"
                      />
                    </a>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                        20 Mar 2024
                      </p>
                      <h6 className="leading-none text-heading font-bold mb-1.5 line-clamp-1">
                        <a href="#">Advance Algorithm</a>
                      </h6>
                    </div>
                  </td>
                  <td className="px-3.5 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href="create-subject.html"
                        className="btn-icon btn-primary-icon-light size-7"
                      >
                        <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                      </a>
                      <button
                        className="btn-icon btn-danger-icon-light size-7"
                        data-modal-target="deleteModal"
                        data-modal-toggle="deleteModal"
                      >
                        <i className="ri-delete-bin-line text-danger text-[13px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white">
                  <td className="flex items-center gap-2 px-3.5 py-4">
                    <a
                      href="#"
                      className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                    >
                      <img
                        src="/assets/images/admin/top-course/top-course-2.png"
                        alt="thumb"
                      />
                    </a>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                        05 Jan 2020
                      </p>
                      <h6 className="leading-none text-heading font-bold mb-1.5 line-clamp-1">
                        <a href="#">JavaScript</a>
                      </h6>
                    </div>
                  </td>
                  <td className="px-3.5 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href="create-subject.html"
                        className="btn-icon btn-primary-icon-light size-7"
                      >
                        <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                      </a>
                      <button
                        className="btn-icon btn-danger-icon-light size-7"
                        data-modal-target="deleteModal"
                        data-modal-toggle="deleteModal"
                      >
                        <i className="ri-delete-bin-line text-danger text-[13px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* <!-- End All Language List Table --> */}
      </div>
    </div>
  );
};

export default AllSubject;
