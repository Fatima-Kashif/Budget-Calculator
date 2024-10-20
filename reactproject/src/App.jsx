import React, { useEffect, useState } from "react";
import "./App.css";
import ReactDOM from "react-dom";
import { Chart } from "react-google-charts";
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

function App() {
  const [portionDisplay, setPortionDisplay] = useState("transaction-history");
  const [showButton, setShowButtons] = useState(false);
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance ? parseFloat(savedBalance) : 0;
  });
  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem("income");
    return savedIncome ? parseFloat(savedIncome) : 0;
  });
  const [expense, setExpense] = useState(() => {
    const savedExpense = localStorage.getItem("expense");
    return savedExpense ? parseFloat(savedExpense) : 0;
  });

  const [formData, setFormData] = useState({
    type: "Income",
    category: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("income", income.toString());
    localStorage.setItem("expense", expense.toString());
  }, [transactions, balance, income, expense]);

  useEffect(() => {
   
      document.title = "Budget Calculator";  
  
    const handleResize = () => {
      if (window.innerWidth <= 450) {
        setShowButtons(true);
      } else {
        setShowButtons(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener for screen resizing
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addTransaction = () => {
    if (!formData.amount || !formData.category) return;

    const newTransaction = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    setTransactions([...transactions, newTransaction]);

    if (newTransaction.type === "Income") {
      setIncome(income + newTransaction.amount);
      setBalance(balance + newTransaction.amount);
    } else {
      setExpense(expense + newTransaction.amount);
      setBalance(balance - newTransaction.amount);
    }

    setFormData({ type: "Income", category: "", amount: "", description: "" });
  };

  const deleteTransaction = (index) => {
    const trans = transactions[index];
    setTransactions(transactions.filter((_, i) => i !== index));

    if (trans.type === "Income") {
      setIncome(income - trans.amount);
      setBalance(balance - trans.amount);
    } else {
      setExpense(expense - trans.amount);
      setBalance(balance + trans.amount);
    }
  };

  const calculateChartData = (type) => {
    const filteredTransactions = transactions.filter(
      (trans) => trans.type === type
    );

    if (filteredTransactions.length === 0) {
      return [
        ["Category", "Amount"],
        ["No Data", 1],
      ]; // Placeholder chart data
    }

    const categoryTotals = {};
    filteredTransactions.forEach((trans) => {
      if (categoryTotals[trans.category]) {
        categoryTotals[trans.category] += trans.amount;
      } else {
        categoryTotals[trans.category] = trans.amount;
      }
    });

    console.log([
      ["Category", "Amount"],
      ...Object.entries(categoryTotals).map(([category, amount]) => [
        category,
        amount,
      ]),
    ]);

    return [
      ["Category", "Amount"],
      ...Object.entries(categoryTotals).map(([category, amount]) => [
        category,
        amount,
      ]),
    ];
  };

  const incomeChartData = calculateChartData("Income");
  const expenseChartData = calculateChartData("Expense");

  return (
    <div className="container">
      <div className="balance-card">
        <p>Available balance</p>
        <h1 style={{ color: balance >= 0 ? "#5AB064" : "#B05A5A" }}>
          ${balance.toFixed(2)}
        </h1>
      </div>

      <div className="summary-cards">
        <div className="income-card">
          <img src="Income.png" alt="" />
          <h2>${income.toFixed(2)}</h2>
          <p>Income</p>
        </div>
        <div className="expense-card">
          <img src="Expense.png" alt="" />
          <h2>${expense.toFixed(2)}</h2>
          <p>Expense</p>
        </div>
      </div>



{ showButton ?(
      <div className="information">
        {portionDisplay === "form-container" && (
          <div className="form-container">
            <h2>Add Transaction</h2>
            <p className="tag">Select Type</p>
            <div className="type-selection">
              <button
                onClick={() => setFormData({ ...formData, type: "Income" })}
                className={formData.type === "Income" ? "active" : ""}
              >
                Income
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: "Expense" })}
                className={formData.type === "Expense" ? "active" : ""}
              >
                Expense
              </button>
            </div>

            <p className="tag">Category</p>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>{" "}
              {/* Added value to the default option */}
              {formData.type === "Income" ? (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Business">Business</option>
                  <option value="Stocks">Stocks</option>
                </>
              ) : formData.type === "Expense" ? (
                <>
                  <option value="Grocery">Grocery</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Food">Food</option>
                </>
              ) : null}
            </select>

            <p className="tag">Amount</p>
            <input
              type="number"
              value={formData.amount}
              placeholder="$$$"
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <p className="tag">Description</p>
            <textarea
              className="box"
              value={formData.description}
              placeholder="Enter a Description..."
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <button onClick={addTransaction}>Add Transaction</button>
          </div>
        )}

        {portionDisplay === "transaction-history" && (
          <div className="transaction-history">
            <h2>Transaction History</h2>
            {transactions.map((trans, index) => (
              <div key={index} className={`transaction-card ${trans.type}`}>
                <div className="transaction-info">
                  <div className="transaction-category">{trans.category}</div>
                  <div className="transaction-amount">
                    ${trans.amount.toFixed(2)}
                  </div>
                  <div className="transaction-description">
                    {trans.description}
                  </div>
                </div>
                <div className="whole">
                  <div className="sidebox">
                    <div
                      className={`transaction-type ${trans.type.toLowerCase()}`}
                    >
                      {trans.type === "Income" ? "Income" : "Expense"}
                    </div>
                    <button
                      onClick={() => deleteTransaction(index)}
                      className="delete-button"
                    >
                      <img src="/Orion_bin 1.png" alt="" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {portionDisplay === "financial-summary" && (
          <div className="financial-summary">
            <h2>Financial Summary</h2>
            <h3>Income</h3>
            <div className="chart1">
              <Chart
                chartType="PieChart"
                width="100%"
                height="100%"
                data={incomeChartData}
                options={{
                  pieHole: 0.65,
                  chartArea: { width: "100%", height: "100%" },
                  backgroundColor: "#F9F9F9",
                  slices:
                    incomeChartData[1][0] === "No Data"
                      ? [{ color: "#8e8e8e" }]
                      : [
                          // { color: '#8e8e8e' },

                          { color: "#04BFDA" },
                          { color: "#9B88ED" },
                          { color: "#FB67CA" },
                          { color: "#FFA84A" },
                        ],
                  legend: {
                    position: "right",
                    alignment: "center",
                  },
                  pieSliceTextStyle: {
                    fontSize: 10,
                    textAlign: "center",
                  },
                }}
              />
            </div>

            <h3>Expense</h3>
            <div className="chart2">
              <Chart
                chartType="PieChart"
                width="100%"
                height="100%"
                data={expenseChartData}
                options={{
                  title: "Expense",
                  pieHole: 0.65,
                  chartArea: { width: "100%", height: "100%" },
                  backgroundColor: "#F9F9F9",
                  slices:
                    expenseChartData[1][0] === "No Data"
                      ? [{ color: "#8e8e8e" }]
                      : [
                          { color: "#04BFDA" },
                          { color: "#9B88ED" },
                          { color: "#FB67CA" },
                          { color: "#FFA84A" },
                        ],
                  legend: {
                    position: "right",
                    alignment: "center",
                  },
                  pieSliceTextStyle: {
                    fontSize: 10,
                    textAlign: "center",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
):(
  <div className="information">
        
          <div className="form-container">
            <h2>Add Transaction</h2>
            <p className="tag">Select Type</p>
            <div className="type-selection">
              <button
                onClick={() => setFormData({ ...formData, type: "Income" })}
                className={formData.type === "Income" ? "active" : ""}
              >
                Income
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: "Expense" })}
                className={formData.type === "Expense" ? "active" : ""}
              >
                Expense
              </button>
            </div>

            <p className="tag">Category</p>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>{" "}
              {/* Added value to the default option */}
              {formData.type === "Income" ? (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Business">Business</option>
                  <option value="Stocks">Stocks</option>
                </>
              ) : formData.type === "Expense" ? (
                <>
                  <option value="Grocery">Grocery</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Food">Food</option>
                </>
              ) : null}
            </select>

            <p className="tag">Amount</p>
            <input
              type="number"
              value={formData.amount}
              placeholder="$$$"
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <p className="tag">Description</p>
            <textarea
              className="box"
              value={formData.description}
              placeholder="Enter a Description..."
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <button className="buttonclick" onClick={addTransaction}>Add Transaction</button>
          </div>
        

        
          <div className="transaction-history">
            <h2>Transaction History</h2>
            {transactions.map((trans, index) => (
              <div key={index} className={`transaction-card ${trans.type}`}>
                <div className="transaction-info">
                  <div className="transaction-category">{trans.category}</div>
                  <div className="transaction-amount">
                    ${trans.amount.toFixed(2)}
                  </div>
                  <div className="transaction-description">
                    {trans.description}
                  </div>
                </div>
                <div className="whole">
                  <div className="sidebox">
                    <div
                      className={`transaction-type ${trans.type.toLowerCase()}`}
                    >
                      {trans.type === "Income" ? "Income" : "Expense"}
                    </div>
                    <button
                      onClick={() => deleteTransaction(index)}
                      className="delete-button"
                    >
                      <img src="/Orion_bin 1.png" alt="" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        

        
          <div className="financial-summary">
            <h2>Financial Summary</h2>
            <h3>Income</h3>
            <div className="chart1">
              <Chart
                chartType="PieChart"
                width="100%"
                height="100%"
                data={incomeChartData}
                options={{
                  pieHole: 0.65,
                  chartArea: { width: "100%", height: "100%" },
                  backgroundColor: "#F9F9F9",
                  slices:
                    incomeChartData[1][0] === "No Data"
                      ? [{ color: "#8e8e8e" }]
                      : 
                    [

                          { color: "#04BFDA" },
                          { color: "#9B88ED" },
                          { color: "#FB67CA" },
                          { color: "#FFA84A" },
                        ],
                  legend: {
                    position: "right",
                    alignment: "center",
                  },
                  pieSliceTextStyle: {
                    fontSize: 10,
                    textAlign: "left",
                  },
                }}
              />
            </div>

            <h3>Expense</h3>
            <div className="chart2">
              <Chart
                chartType="PieChart"
                width="100%"
                height="100%"
                data={expenseChartData}
                options={{
                  title: "Expense",
                  pieHole: 0.65,
                  chartArea: { width: "100%", height: "100%" },
                  backgroundColor: "#F9F9F9",
                  slices:
                    expenseChartData[1][0] === "No Data"
                      ? [{ color: "#8e8e8e" }]
                      :
                       [
                          { color: "#04BFDA" },
                          { color: "#9B88ED" },
                          { color: "#FB67CA" },
                          { color: "#FFA84A" },
                        ],
                  legend: {
                    position: "right",
                    alignment: "center",
                  },
                  pieSliceTextStyle: {
                    fontSize: 10,
                    textAlign: "left",
                  },
                }}
              />
            </div>
          </div>
       
      </div>
)
}
      {showButton && (
        <div>
          {portionDisplay === "financial-summary" && (
            <div className="button-bottom">
              <button className="buttonclick"  onClick={() => setPortionDisplay("form-container")}>
                Add Transaction
              </button>
              <button className="buttonclick" onClick={() => setPortionDisplay("transaction-history")}>
                Transaction History
              </button>
            </div>
          )}
          {portionDisplay === "form-container" && (
            <div className="button-bottom">
              <button className="buttonclick" onClick={() => setPortionDisplay("financial-summary")}>
                Financial Summary
              </button>
              <button className="buttonclick" onClick={() => setPortionDisplay("transaction-history")}>
                Transaction History
              </button>
            </div>
          )}
          {portionDisplay === "transaction-history" && (
            <div className="button-bottom">
              <button className="buttonclick" onClick={() => setPortionDisplay("form-container")}>
                Add Transaction
              </button>

              <button className="buttonclick" onClick={() => setPortionDisplay("financial-summary")}>
                Financial Summary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

}

export default App;
