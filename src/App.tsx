import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allEmployeesSelected, setAllEmployeesSelected] = useState(true)

  console.log("employees", employees, "paginatedTransactions", paginatedTransactions, "transactionsByEmployee", transactionsByEmployee)
  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    // Clearing the transactions
    transactionsByEmployeeUtils.invalidateData();
  
    try {
      await employeeUtils.fetchAll();
      await paginatedTransactionsUtils.fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);
  
  

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsLoading(true);
      paginatedTransactionsUtils.invalidateData();

      try {
        await transactionsByEmployeeUtils.fetchById(employeeId);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
);
  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        {error && <div className="Error">{error}</div>}

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            
            if (newValue === null || newValue === EMPTY_EMPLOYEE) {
              setAllEmployeesSelected(true)
              // Reset transactions when no employee is selected
              // paginatedTransactionsUtils.invalidateData();
              // Fetching all transactions again
              loadAllTransactions();
              return;
            }
            setAllEmployeesSelected(false)
            await loadTransactionsByEmployee(newValue.id);
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && allEmployeesSelected && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await paginatedTransactionsUtils.fetchNextPage();
              }}
              aria-label="View more transactions"
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
