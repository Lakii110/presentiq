"""
Generate visual representations for ML model evaluation.
Creates charts and graphs for academic presentation.

Run: python generate_evaluation_visualizations.py
Output: evaluation_charts/ folder with PNG images
"""

import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 12

def load_evaluation_data():
    """Load evaluation results from JSON"""
    data_file = Path(__file__).parent / "data" / "ml_evaluation_tabular_scores_results.json"
    with open(data_file, 'r') as f:
        return json.load(f)

def create_output_dir():
    """Create output directory for charts"""
    output_dir = Path(__file__).parent.parent / "evaluation_charts"
    output_dir.mkdir(exist_ok=True)
    return output_dir

def plot_accuracy_comparison(data, output_dir):
    """Chart 1: Accuracy Comparison"""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    models = ['Fluency', 'Prosodic/Tone']
    holdout_acc = [
        data['fluency_holdout']['classification']['accuracy'] * 100,
        data['prosodic_holdout']['classification']['accuracy'] * 100
    ]
    cv_acc = [
        data['fluency_cv']['classification_fold_mean']['accuracy'] * 100,
        data['prosodic_cv']['classification_fold_mean']['accuracy'] * 100
    ]
    
    x = np.arange(len(models))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, holdout_acc, width, label='Test Set', color='#4f46e5')
    bars2 = ax.bar(x + width/2, cv_acc, width, label='10-Fold CV', color='#10b981')
    
    ax.set_ylabel('Accuracy (%)', fontsize=14, fontweight='bold')
    ax.set_title('Model Accuracy Comparison', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(models, fontsize=12)
    ax.legend(fontsize=12)
    ax.set_ylim([90, 100])
    ax.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.2f}%',
                   ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_dir / '1_accuracy_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 1_accuracy_comparison.png")

def plot_confusion_matrices(data, output_dir):
    """Chart 2: Confusion Matrices"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Fluency confusion matrix
    flu_cm = data['fluency_holdout']['classification']['confusion_matrix']
    flu_matrix = np.array([[flu_cm['tn'], flu_cm['fp']], 
                           [flu_cm['fn'], flu_cm['tp']]])
    
    sns.heatmap(flu_matrix, annot=True, fmt='d', cmap='Blues', ax=ax1,
                xticklabels=['Poor (<5)', 'Good (≥5)'],
                yticklabels=['Poor (<5)', 'Good (≥5)'],
                cbar_kws={'label': 'Count'})
    ax1.set_title('Fluency Model', fontsize=14, fontweight='bold', pad=15)
    ax1.set_ylabel('True Label', fontsize=12, fontweight='bold')
    ax1.set_xlabel('Predicted Label', fontsize=12, fontweight='bold')
    
    # Prosodic confusion matrix
    pro_cm = data['prosodic_holdout']['classification']['confusion_matrix']
    pro_matrix = np.array([[pro_cm['tn'], pro_cm['fp']], 
                           [pro_cm['fn'], pro_cm['tp']]])
    
    sns.heatmap(pro_matrix, annot=True, fmt='d', cmap='Greens', ax=ax2,
                xticklabels=['Poor (<5)', 'Good (≥5)'],
                yticklabels=['Poor (<5)', 'Good (≥5)'],
                cbar_kws={'label': 'Count'})
    ax2.set_title('Prosodic/Tone Model', fontsize=14, fontweight='bold', pad=15)
    ax2.set_ylabel('True Label', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Predicted Label', fontsize=12, fontweight='bold')
    
    plt.suptitle('Confusion Matrices (Test Set)', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(output_dir / '2_confusion_matrices.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 2_confusion_matrices.png")

def plot_metrics_comparison(data, output_dir):
    """Chart 3: Multiple Metrics Comparison"""
    fig, ax = plt.subplots(figsize=(12, 7))
    
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
    
    flu_values = [
        data['fluency_holdout']['classification']['accuracy'],
        data['fluency_holdout']['classification']['precision'],
        data['fluency_holdout']['classification']['recall'],
        data['fluency_holdout']['classification']['f1'],
        data['fluency_holdout']['classification']['roc_auc']
    ]
    
    pro_values = [
        data['prosodic_holdout']['classification']['accuracy'],
        data['prosodic_holdout']['classification']['precision'],
        data['prosodic_holdout']['classification']['recall'],
        data['prosodic_holdout']['classification']['f1'],
        data['prosodic_holdout']['classification']['roc_auc']
    ]
    
    x = np.arange(len(metrics))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, flu_values, width, label='Fluency', color='#4f46e5', alpha=0.8)
    bars2 = ax.bar(x + width/2, pro_values, width, label='Prosodic/Tone', color='#10b981', alpha=0.8)
    
    ax.set_ylabel('Score', fontsize=14, fontweight='bold')
    ax.set_title('Classification Metrics Comparison (Test Set)', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=11)
    ax.legend(fontsize=12)
    ax.set_ylim([0.9, 1.0])
    ax.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.4f}',
                   ha='center', va='bottom', fontsize=9, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_dir / '3_metrics_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 3_metrics_comparison.png")

def plot_cv_results(data, output_dir):
    """Chart 4: Cross-Validation Results with Error Bars"""
    fig, ax = plt.subplots(figsize=(12, 7))
    
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
    
    flu_means = [
        data['fluency_cv']['classification_fold_mean']['accuracy'],
        data['fluency_cv']['classification_fold_mean']['precision'],
        data['fluency_cv']['classification_fold_mean']['recall'],
        data['fluency_cv']['classification_fold_mean']['f1'],
        data['fluency_cv']['classification_fold_mean']['roc_auc']
    ]
    
    flu_stds = [
        data['fluency_cv']['classification_fold_std']['accuracy'],
        data['fluency_cv']['classification_fold_std']['precision'],
        data['fluency_cv']['classification_fold_std']['recall'],
        data['fluency_cv']['classification_fold_std']['f1'],
        data['fluency_cv']['classification_fold_std']['roc_auc']
    ]
    
    pro_means = [
        data['prosodic_cv']['classification_fold_mean']['accuracy'],
        data['prosodic_cv']['classification_fold_mean']['precision'],
        data['prosodic_cv']['classification_fold_mean']['recall'],
        data['prosodic_cv']['classification_fold_mean']['f1'],
        data['prosodic_cv']['classification_fold_mean']['roc_auc']
    ]
    
    pro_stds = [
        data['prosodic_cv']['classification_fold_std']['accuracy'],
        data['prosodic_cv']['classification_fold_std']['precision'],
        data['prosodic_cv']['classification_fold_std']['recall'],
        data['prosodic_cv']['classification_fold_std']['f1'],
        data['prosodic_cv']['classification_fold_std']['roc_auc']
    ]
    
    x = np.arange(len(metrics))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, flu_means, width, yerr=flu_stds, 
                   label='Fluency', color='#4f46e5', alpha=0.8, capsize=5)
    bars2 = ax.bar(x + width/2, pro_means, width, yerr=pro_stds,
                   label='Prosodic/Tone', color='#10b981', alpha=0.8, capsize=5)
    
    ax.set_ylabel('Score', fontsize=14, fontweight='bold')
    ax.set_title('10-Fold Cross-Validation Results (Mean ± Std)', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=11)
    ax.legend(fontsize=12)
    ax.set_ylim([0.9, 1.0])
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / '4_cv_results.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 4_cv_results.png")

def plot_regression_metrics(data, output_dir):
    """Chart 5: Regression Metrics"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # MAE and RMSE
    models = ['Fluency', 'Prosodic/Tone']
    mae_values = [
        data['fluency_holdout']['regression']['mae'],
        data['prosodic_holdout']['regression']['mae']
    ]
    rmse_values = [
        data['fluency_holdout']['regression']['rmse'],
        data['prosodic_holdout']['regression']['rmse']
    ]
    
    x = np.arange(len(models))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, mae_values, width, label='MAE', color='#f59e0b')
    bars2 = ax1.bar(x + width/2, rmse_values, width, label='RMSE', color='#ef4444')
    
    ax1.set_ylabel('Error', fontsize=12, fontweight='bold')
    ax1.set_title('Mean Absolute Error & RMSE', fontsize=14, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(models)
    ax1.legend()
    ax1.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.3f}',
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    # R² Score
    r2_values = [
        data['fluency_holdout']['regression']['r2'],
        data['prosodic_holdout']['regression']['r2']
    ]
    
    bars = ax2.bar(models, r2_values, color=['#4f46e5', '#10b981'], alpha=0.8)
    ax2.set_ylabel('R² Score', fontsize=12, fontweight='bold')
    ax2.set_title('Coefficient of Determination (R²)', fontsize=14, fontweight='bold')
    ax2.set_ylim([0, 1])
    ax2.grid(axis='y', alpha=0.3)
    ax2.axhline(y=0.7, color='red', linestyle='--', alpha=0.5, label='Good threshold (0.7)')
    ax2.legend()
    
    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.4f}',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.suptitle('Regression Performance Metrics', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(output_dir / '5_regression_metrics.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 5_regression_metrics.png")

def plot_dataset_info(data, output_dir):
    """Chart 6: Dataset Information"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Train/Test split
    train_n = data['train_n']
    test_n = data['test_n']
    
    sizes = [train_n, test_n]
    labels = [f'Train\n({train_n:,})', f'Test\n({test_n:,})']
    colors = ['#4f46e5', '#10b981']
    explode = (0.05, 0)
    
    ax1.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
            shadow=True, startangle=90, textprops={'fontsize': 12, 'fontweight': 'bold'})
    ax1.set_title('Train/Test Split', fontsize=14, fontweight='bold', pad=20)
    
    # Feature count
    n_features = len(data['feature_names'])
    ax2.bar(['Features'], [n_features], color='#8b5cf6', alpha=0.8, width=0.5)
    ax2.set_ylabel('Count', fontsize=12, fontweight='bold')
    ax2.set_title(f'Number of Features: {n_features}', fontsize=14, fontweight='bold', pad=20)
    ax2.set_ylim([0, n_features + 5])
    ax2.grid(axis='y', alpha=0.3)
    
    # Add value label
    ax2.text(0, n_features, f'{n_features}', ha='center', va='bottom', 
            fontsize=14, fontweight='bold')
    
    plt.suptitle('Dataset Information', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(output_dir / '6_dataset_info.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 6_dataset_info.png")

def create_summary_table(data, output_dir):
    """Chart 7: Summary Table"""
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.axis('tight')
    ax.axis('off')
    
    # Prepare data
    table_data = [
        ['Metric', 'Fluency (Test)', 'Prosodic (Test)', 'Fluency (10-Fold CV)', 'Prosodic (10-Fold CV)'],
        ['Accuracy', 
         f"{data['fluency_holdout']['classification']['accuracy']*100:.2f}%",
         f"{data['prosodic_holdout']['classification']['accuracy']*100:.2f}%",
         f"{data['fluency_cv']['classification_fold_mean']['accuracy']*100:.2f}% ± {data['fluency_cv']['classification_fold_std']['accuracy']*100:.2f}%",
         f"{data['prosodic_cv']['classification_fold_mean']['accuracy']*100:.2f}% ± {data['prosodic_cv']['classification_fold_std']['accuracy']*100:.2f}%"],
        ['Precision',
         f"{data['fluency_holdout']['classification']['precision']:.4f}",
         f"{data['prosodic_holdout']['classification']['precision']:.4f}",
         f"{data['fluency_cv']['classification_fold_mean']['precision']:.4f} ± {data['fluency_cv']['classification_fold_std']['precision']:.4f}",
         f"{data['prosodic_cv']['classification_fold_mean']['precision']:.4f} ± {data['prosodic_cv']['classification_fold_std']['precision']:.4f}"],
        ['Recall',
         f"{data['fluency_holdout']['classification']['recall']:.4f}",
         f"{data['prosodic_holdout']['classification']['recall']:.4f}",
         f"{data['fluency_cv']['classification_fold_mean']['recall']:.4f} ± {data['fluency_cv']['classification_fold_std']['recall']:.4f}",
         f"{data['prosodic_cv']['classification_fold_mean']['recall']:.4f} ± {data['prosodic_cv']['classification_fold_std']['recall']:.4f}"],
        ['F1-Score',
         f"{data['fluency_holdout']['classification']['f1']:.4f}",
         f"{data['prosodic_holdout']['classification']['f1']:.4f}",
         f"{data['fluency_cv']['classification_fold_mean']['f1']:.4f} ± {data['fluency_cv']['classification_fold_std']['f1']:.4f}",
         f"{data['prosodic_cv']['classification_fold_mean']['f1']:.4f} ± {data['prosodic_cv']['classification_fold_std']['f1']:.4f}"],
        ['ROC-AUC',
         f"{data['fluency_holdout']['classification']['roc_auc']:.4f}",
         f"{data['prosodic_holdout']['classification']['roc_auc']:.4f}",
         f"{data['fluency_cv']['classification_fold_mean']['roc_auc']:.4f} ± {data['fluency_cv']['classification_fold_std']['roc_auc']:.4f}",
         f"{data['prosodic_cv']['classification_fold_mean']['roc_auc']:.4f} ± {data['prosodic_cv']['classification_fold_std']['roc_auc']:.4f}"],
        ['MAE',
         f"{data['fluency_holdout']['regression']['mae']:.4f}",
         f"{data['prosodic_holdout']['regression']['mae']:.4f}",
         f"{data['fluency_cv']['regression_fold_mean']['mae']:.4f} ± {data['fluency_cv']['regression_fold_std']['mae']:.4f}",
         f"{data['prosodic_cv']['regression_fold_mean']['mae']:.4f} ± {data['prosodic_cv']['regression_fold_std']['mae']:.4f}"],
        ['R²',
         f"{data['fluency_holdout']['regression']['r2']:.4f}",
         f"{data['prosodic_holdout']['regression']['r2']:.4f}",
         f"{data['fluency_cv']['regression_fold_mean']['r2']:.4f} ± {data['fluency_cv']['regression_fold_std']['r2']:.4f}",
         f"{data['prosodic_cv']['regression_fold_mean']['r2']:.4f} ± {data['prosodic_cv']['regression_fold_std']['r2']:.4f}"],
    ]
    
    table = ax.table(cellText=table_data, cellLoc='center', loc='center',
                    colWidths=[0.15, 0.2, 0.2, 0.225, 0.225])
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2.5)
    
    # Style header row
    for i in range(5):
        table[(0, i)].set_facecolor('#4f46e5')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    # Style metric column
    for i in range(1, 8):  # Fixed: 8 rows of data (1-7)
        table[(i, 0)].set_facecolor('#e0e7ff')
        table[(i, 0)].set_text_props(weight='bold')
    
    # Alternate row colors
    for i in range(1, 8):  # Fixed: 8 rows of data (1-7)
        for j in range(1, 5):
            if i % 2 == 0:
                table[(i, j)].set_facecolor('#f9fafb')
    
    plt.title('Complete Evaluation Results Summary', fontsize=16, fontweight='bold', pad=20)
    plt.savefig(output_dir / '7_summary_table.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Created: 7_summary_table.png")

def main():
    print("=" * 60)
    print("Generating Evaluation Visualizations")
    print("=" * 60)
    print()
    
    # Load data
    print("📊 Loading evaluation data...")
    data = load_evaluation_data()
    
    # Create output directory
    output_dir = create_output_dir()
    print(f"📁 Output directory: {output_dir}")
    print()
    
    # Generate all charts
    print("🎨 Generating charts...")
    plot_accuracy_comparison(data, output_dir)
    plot_confusion_matrices(data, output_dir)
    plot_metrics_comparison(data, output_dir)
    plot_cv_results(data, output_dir)
    plot_regression_metrics(data, output_dir)
    plot_dataset_info(data, output_dir)
    create_summary_table(data, output_dir)
    
    print()
    print("=" * 60)
    print("✅ All visualizations generated successfully!")
    print("=" * 60)
    print()
    print(f"📂 Charts saved in: {output_dir}")
    print()
    print("Generated files:")
    print("  1. 1_accuracy_comparison.png")
    print("  2. 2_confusion_matrices.png")
    print("  3. 3_metrics_comparison.png")
    print("  4. 4_cv_results.png")
    print("  5. 5_regression_metrics.png")
    print("  6. 6_dataset_info.png")
    print("  7. 7_summary_table.png")
    print()
    print("💡 Use these charts in your presentation/report!")

if __name__ == "__main__":
    main()
