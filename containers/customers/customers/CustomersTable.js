/* eslint-disable react/display-name */

import axios from "axios";
import Dropdown from "components/Misc/Dropdown";
import PatchedPagination from "components/Misc/PatchedPagination";
import { tableIcons } from "components/Misc/TableIcons";
import Modal from "components/Modal";
import { capitalize, filter } from "lodash";
import MaterialTable, { MTableToolbar } from "material-table";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import CustomerDetails from "./CustomerDetails";
import CustomerOrdersDetails from "./CustomerOrdersDetails";
import CustomerTransactions from "./CustomerTransactions";

const CustomersTable = ({}) => {
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const dispatch = useDispatch();
  const router = useRouter();
  const { addToast, removeToast } = useToasts();
  const {
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({});

  const allCustomers = useSelector((state) => state.customers.allCustomers);
  //   console.log(allCustomers);

  const [allProducts, setAllProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [customer, setCustomer] = React.useState(null);
  const [componentToRender, setComponentToRender] = React.useState("cust_details");

  const buttons = (data) => [
    {
      name: "Customer - Details",
      action() {
        setCustomer(data);
        setComponentToRender("cust_details");
        setOpenModal(true);
      },
    },
    {
      name: "Customers Transaction - Details",
      action() {
        setCustomer(data);
        setComponentToRender("trans_details");
        setOpenModal(true);
      },
    },
    {
      name: "Customers Orders - Details",
      action() {
        setCustomer(data);
        setComponentToRender("order_details");
        setOpenModal(true);
      },
    },
  ];

  const columns = [
    { title: "Customer ID", field: "customer_id" },
    {
      title: "Name",
      field: "customer_name",
      render(rowData) {
        return (
          <div>
            <p>{rowData?.customer_name}</p>
            <div className="text-xs text-gray-500">
              {rowData?.customer_addresses?.map((address) => {
                return (
                  <p key={address.Address} className="my-2">
                    {address.Tag}: {address.Address}
                  </p>
                );
              })}
            </div>
          </div>
        );
      },
      cellStyle() {
        return {
          width: "100%",
        };
      },
    },
    { title: "Phone", field: "customer_phone" },
    {
      title: "Alt Phone",
      field: "customer_alt_phone",
      render(rowData) {
        return (
          <div>
            <p>{rowData?.customer_alt_phone || "N/A"}</p>
          </div>
        );
      },
    },
    {
      title: "Email",
      field: "customer_email",
      render(rowData) {
        return (
          <div>
            <p>{rowData?.customer_email || "N/A"}</p>
          </div>
        );
      },
    },
    {
      title: "Date of Birth",
      field: "customer_dob",
      cellStyle() {
        return {
          width: "100%",
        };
      },
    },
    { title: "Total Spend", field: "total_spends", defaultSort: "desc" },
    { title: "Total Counts", field: "total_counts" },
    // { title: "Addresses", field: "customer_addresses",  },
    {
      title: "Actions",
      field: "actions",
      render(rowData) {
        return <Dropdown rowData={rowData} buttons={() => buttons(rowData)} />;
      },
      disableClick: true,
    },
  ];

  return (
    <>
      <Modal
        open={openModal}
        maxWidth="md"
        onClose={() => {
          setOpenModal(false);
          // setReRun(new Date());
        }}
      >
        {componentToRender === "cust_details" && (
          <CustomerDetails
            customer={customer}
            user={user}
            onClose={() => {
              setOpenModal(false);
            }}
          />
        )}

        {componentToRender === "trans_details" && (
          <CustomerTransactions
            customer={customer}
            user={user}
            onClose={() => {
              setOpenModal(false);
            }}
          />
        )}

        {componentToRender === "order_details" && (
          <CustomerOrdersDetails
            customer={customer}
            user={user}
            onClose={() => {
              setOpenModal(false);
            }}
          />
        )}
      </Modal>

      <div>
        <MaterialTable
          isLoading={loading}
          title={<p className="font-bold text-xl">{`Customers`}</p>}
          icons={tableIcons}
          columns={columns}
          data={allCustomers.map((o) => ({ ...o, tableData: {} }))}
          options={{
            selection: false,
          }}
          components={{
            Toolbar: (props) => (
              <div>
                <MTableToolbar {...props} />
              </div>
            ),
            Pagination: PatchedPagination,
          }}
          //   onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
      </div>
    </>
  );
};

export default CustomersTable;
