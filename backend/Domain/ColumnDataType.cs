namespace DashboardAnalyticsAPI.Domain;

/// <summary>
/// Canonical data type identifiers stored in DatasetColumn.DataType.
/// String constants avoid enum-to-string conversion at DB and JSON layers.
/// </summary>
public static class ColumnDataType
{
    public const string Number   = "number";
    public const string String   = "string";
    public const string Date     = "date";
    public const string DateTime = "datetime";
    public const string Boolean  = "boolean";
}
