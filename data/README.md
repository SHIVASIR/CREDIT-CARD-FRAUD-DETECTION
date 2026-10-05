# Dataset Instructions: Credit Card Fraud Detection

This project uses the benchmark **Credit Card Fraud Detection** dataset (originally collected by the Machine Learning Group at Université Libre de Bruxelles - ULB, hosted on Kaggle).

### Dataset Overview
- **Total Transactions:** 284,807 transactions collected over two days in September 2013 by European cardholders.
- **Fraudulent Transactions:** 492 cases (0.172% of all transactions) — extreme class imbalance.
- **Features:**
  - `Time`: Elapsed seconds from the initial transaction in the dataset.
  - `V1` through `V28`: 28 numerical principal components extracted via Principal Component Analysis (PCA) to protect cardholder privacy.
  - `Amount`: Transaction monetary amount in Euro (₹ / $ equivalents supported in UI).
  - `Class`: Response variable (1 for Fraudulent, 0 for Legitimate).

### Download & Placement
To train on the complete 150 MB dataset:
1. Download `creditcard.csv` from [Kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).
2. Place the file at:
   ```bash
   data/creditcard.csv
   ```
3. Run the training script:
   ```bash
   python ml/train_model.py
   ```

*Note:* If `creditcard.csv` is not present, `ml/preprocess.py` and the Flask backend automatically utilize a calibrated synthetic benchmark matching the exact mathematical distributions and feature correlations.
