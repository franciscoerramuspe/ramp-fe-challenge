import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )

      setTransactionsByEmployee(data)
    },
    [fetchWithCache]
  )

  const invalidateData = useCallback(() => {
    // Sets transactions to empty or null
    setTransactionsByEmployee(null)
  }, [])

  const updateEmployeeTransaction = useCallback(() => {
    // Sets transactions to empty or null
    console.log("from", updateEmployeeTransaction)
  }, [])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData, updateEmployeeTransaction }
}
