import React from "react";
import { DynamicTable } from "@maherunlocker/custom-react-table-responsive";
function App() {
  const [count, setCount] = React.useState(0);
  const [filterActive, setLocalFilterActive] = React.useState<boolean>(false);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [dataIsUpdated, setDataIsUpdated] = React.useState<boolean | number>(
    false
  );
  return (
    <DynamicTable
      //put your backed api url it's obligation  to get your date from api

      url="http://localhost:4000/categories"
      // url='http://localhost:4000/cards'

      //optionnal props
      name="mytable"
      // --->here for add custom component in the end of table
      //actionColumn={SelectAccountDropdown}
      // --->here you can add component side Filter Button
      // customJsxSideFilterButton={<FilterSideComponent />}
      // --->here for grouping columns with same name
      canGroupBy
      // --->here for sorting table
      canSort
      // --->here for resizing with of column
      canResize
      // --->here for row and subrows
      canExpand
      // --->here showing checkbox in the begin of RowTable with return you the checked rows
      canSelect
      // setSelectedRows={setSelectedRows}
      // --->here showing global filter input on the top of table
      showGlobalFilter
      // --->here showing  filter button  on the top of table
      showFilter
      filterActive={filterActive}
      setLocalFilterActive={setLocalFilterActive}
      // --->here add action header with delete and duplicate
      canDeleteOrDuplicate
      // --->here you can add any column to the table in the specified place with custom name and customjsx
      //arrayOfCustomColumns={arrayOfCustomColumns}
      // --->here  if you don't have any other click in row you can use to get clicked row details
      onClick={(row: any) => console.log(row.original)}
      // when you update your backend set dataIsUpdated to true to render table
      setDataIsUpdated={setDataIsUpdated}
      dataIsUpdated={dataIsUpdated}
    />
  );
}

export default App;
