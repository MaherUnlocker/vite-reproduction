import useSWR from "swr";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  useFilters,
  useSortBy,
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import { Button } from "react-bootstrap";
import { formatDateDistanceToNow } from "../utils/date-from-now";
import AddResourceModal from "./modal-add-resource";
import ViewResourceModal from "./modal-view-resource";

// Define a default UI for global filter
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div className="input-group">
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search ${count} Resources...`}
        className="form-control form-control-sm"
      />
      <div className="input-group-append">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setValue("");
            onChange("");
          }}
        >
          <i className="bi-x"></i>
        </Button>
      </div>
    </div>
  );
}

// Define a default UI for filtering
function TextColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder="Search..."
      className="border-0 w-100"
      style={{ outline: "none" }}
    />
  );
}

// No filter; TODO: disable filter instead of having to use a NULL one
function NoFilter() {
  return null;
}

export default function ResourcesTable() {
  // start fetching table data
  const { data: swrResources, error: swrResourcesError } = useSWR(
    "http://localhost:4000/client"
  );
  // start fetching data for tag suggestions
  const { data: swrTagSuggestions, error: swrTagSuggestionsError } = useSWR(
    "http://localhost:4000/client"
  );
  // to prevent losing sort and filter state when data updates
  const skipPageResetRef = useRef();

  const columns = useMemo(
    () => [
      {
        Header: "Domain",
        accessor: "domain",
        Cell: ({ row, value }) => {
          return (
            <div className="d-inline text-nowrap">
              {row.original.url ? (
                <a
                  href={row.original.url}
                  target="_blank"
                  className="thh-cursor-alias"
                  title="Open Resource in new window"
                >
                  <img
                    height={24}
                    src={row.original.favicon}
                    className="mr-2"
                  />
                  {value}
                </a>
              ) : (
                <>
                  <img
                    height={24}
                    src={row.original.favicon}
                    className="mr-2"
                  />
                  {value}
                </>
              )}
            </div>
          );
        },
        Filter: NoFilter,
      },
      {
        Header: "Title",
        accessor: "title",
        Cell: ({ row, value }) => {
          return (
            <span
              onClick={() => handleShowViewResourceModal(row.original)}
              title="Resource Title"
              className="thh-cursor-zoom-in"
            >
              {value}
            </span>
          );
        },
        Filter: TextColumnFilter,
        dataLabel: "Title",
      },
      {
        Header: "Type",
        accessor: "type",
        Filter: TextColumnFilter,
        dataLabel: "Type",
      },
      {
        Header: "Tags",
        accessor: (row) =>
          row.resourceTags.map((resourceTag) => resourceTag.name).join(", "),
        Filter: TextColumnFilter,
        dataLabel: "Tags",
      },
      {
        Header: "Boards",
        accessor: (row) =>
          row.resourceBoards
            .map((resourceBoard) => resourceBoard.name)
            .join(", "),
        Cell: ({ row }) => {
          return (
            <>
              {row.original.resourceBoards.map((board) => (
                <a
                  key={board.id}
                  className="btn btn-light thh-btn-xs mr-1 mb-1 text-nowrap"
                  href={`/board-draggable/${board.slug}`}
                >
                  {board.name}
                </a>
              ))}
            </>
          );
        },
        Filter: TextColumnFilter,
        dataLabel: "Boards",
      },
      {
        Header: "Updated",
        accessor: "updatedAt",
        Cell: ({ value }) => {
          return (
            <span className="text-nowrap">
              {formatDateDistanceToNow(value)}
            </span>
          );
        },
        Filter: NoFilter,
        dataLabel: "Updated",
      },
      {
        Header: () => {
          return <i className="bi-check-square-fill" title="Read?"></i>;
        },
        accessor: "readAt",
        Cell: ({ value }) => {
          return value ? (
            <i
              className="bi-check-square-fill text-success"
              title={`Marked as Read ${formatDateDistanceToNow(value)}`}
            ></i>
          ) : (
            <i
              className="bi-check-square text-muted"
              title="Not marked as Read"
            ></i>
          );
        },
        sortDescFirst: true,
        Filter: NoFilter,
        dataLabel: "Read",
      },
      {
        Header: () => {
          return <i className="bi-heart-fill" title="Favorited?"></i>;
        },
        accessor: "favoritedAt",
        Cell: ({ value }) => {
          return value ? (
            <i
              className="bi-heart-fill text-danger"
              title={`Favorited ${formatDateDistanceToNow(value)}`}
            ></i>
          ) : (
            <i className="bi-heart text-muted" title="Not Favorited"></i>
          );
        },
        sortDescFirst: true,
        Filter: NoFilter,
        dataLabel: "Favorited",
      },
      {
        Header: () => {
          return <i className="bi-reception-4" title="Quality"></i>;
        },
        accessor: "quality",
        Cell: ({ value }) => {
          return value ? (
            <i
              className={`bi-reception-${value} text-info`}
              title="Quality"
            ></i>
          ) : (
            <i
              className="bi-reception-0 text-muted"
              title="Quality not set"
            ></i>
          );
        },
        sortDescFirst: true,
        Filter: NoFilter,
        dataLabel: "Quality",
      },
      {
        Header: () => {
          return (
            <i className="bi-chat-left-text-fill" title="Activity Count"></i>
          );
        },
        accessor: "activityCount",
        Cell: ({ row, value }) => {
          return (
            <span
              onClick={() => handleShowViewResourceModal(row.original)}
              title="Activity Count"
              className="thh-cursor-zoom-in"
            >
              <span className="badge badge-primary">
                <i className="bi-chat-left-text-fill" /> {value}
              </span>
            </span>
          );
        },
        sortDescFirst: true,
        Filter: NoFilter,
        dataLabel: "Activity",
      },
    ],
    []
  );

  // per react-table, data must be memoized
  const resources = useMemo(() => dataChecker(), [swrResources]);
  function dataChecker() {
    skipPageResetRef.current = true;
    console.log("useMemo: data changed!", swrResources);
    return swrResources ? swrResources : [];
  }
  // set up react-table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: resources,
      autoResetSortBy: !skipPageResetRef.current,
      autoResetFilters: !skipPageResetRef.current,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  });

  const refAddResourceModal = useRef();
  const handleShowAddResourceModal = () => {
    refAddResourceModal.current.handleShow();
  };

  const refViewResourceModal = useRef();
  const handleShowViewResourceModal = (resource) => {
    refViewResourceModal.current.handleShow(resource);
  };

  function handleAdd_Resource(addedResource) {
    const newData = [...swrResources];
    newData.unshift(addedResource);
    console.log("Ran Function: handleAdd_Resource:", newData, addedResource);
    mutate("/api/get-resources-more", swrResources, false);
  }

  function handleChange_Resource(changedResource) {
    const resourceIndex = swrResources.findIndex(
      (resource) => resource.id === changedResource.id
    );
    if (resourceIndex > -1) {
      const newData = swrResources.filter(
        (resource) => resource.id !== changedResource.id
      );
      newData.splice(resourceIndex, 0, changedResource);
      console.log(
        "Ran Function: handleChange_Resource:",
        newData,
        changedResource,
        resourceIndex
      );
      mutate("/api/get-resources-more", swrResources, false);
    }
  }

  if (swrResourcesError)
    return <div className="text-center my-3">An error occured.</div>;
  if (!swrResources)
    return <div className="text-center my-3">Loading your Library...</div>;

  return (
    <>
      <div className="thh-library-table-container">
        <table
          {...getTableProps()}
          className="table table-responsive-lg small thh-library-table"
        >
          <thead>
            <tr className="thh-table-global-search">
              <th
                colSpan={visibleColumns.length}
                className="pt-0 px-md-0 border-top-0"
                style={{
                  textAlign: "left",
                }}
              >
                <div className="row">
                  <div className="col">
                    <GlobalFilter
                      preGlobalFilteredRows={preGlobalFilteredRows}
                      globalFilter={state.globalFilter}
                      setGlobalFilter={setGlobalFilter}
                    />
                  </div>
                  <div className="col-auto">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleShowAddResourceModal}
                    >
                      Add Resource
                    </Button>
                  </div>
                </div>
              </th>
            </tr>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    data-label={column.dataLabel}
                  >
                    <div className="mb-2">
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
                    <span {...column.getSortByToggleProps()}>
                      {column.render("Header")}
                      {/* Add a sort direction indicator */}
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <i className="bi-caret-down-fill ml-1"></i>
                        ) : (
                          <i className="bi-caret-up-fill ml-1"></i>
                        )
                      ) : (
                        ""
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        data-label={cell.column.dataLabel}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AddResourceModal
        onChangeHandler={handleAdd_Resource}
        ref={refAddResourceModal}
      />
      <ViewResourceModal
        onResourceChange={handleChange_Resource}
        tagSuggestions={swrTagSuggestions}
        tagSuggestionsError={swrTagSuggestionsError}
        ref={refViewResourceModal}
      />
    </>
  );
}
