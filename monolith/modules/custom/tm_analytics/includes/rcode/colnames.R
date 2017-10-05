args <- commandArgs(trailingOnly = TRUE)
library(data.table)

GetColumnsTypes <- function(dataFrame,
                            dateFormat = c("%d/%m/%Y",
                                           "%m/%d/%Y",
                                           "%Y/%m/%d",
                                           "%Y/%d/%m",
                                           "%d-%m-%Y",
                                           "%m-%d-%Y",
                                           "%Y-%m-%d",
                                           "%Y-%d-%m",
                                           "%d%B%Y",
                                           "%B%d%Y")) {
  
  # get column names
  colnames <- colnames(dataFrame)
  
  # try to coerce all the columns to as.Date and see which are succeed.
  IsDateCols <- sapply(dataFrame, IsDateCol, dateFormat)
  
  # get colTypes
  colTypes <- sapply(dataFrame, class)
  
  # assign column type Date, if found in IsDateCols
  for (i in seq_along(colnames)) {
    
    # check levels of factor if > 15 then character else factor
    factorOrChar <- ""
    if (nrow(dataFrame) > 20) {
      if(colTypes[[colnames[[i]]]] == "factor") {
        
        if(length(levels(dataFrame[,colnames[[i]]])) > 20) {
          factorOrChar <- "character" 
        } else {
          factorOrChar <- "factor"
        }
      }
    }
    
    colType <- ifelse(factorOrChar == "", colTypes[[colnames[[i]]]], 
                      factorOrChar)
    
    colTypes[[colnames[[i]]]] <- ifelse(IsDateCols[[colnames[[i]]]]
                                        == TRUE,
                                        yes = "Date",
                                        no = colType)
  }
  as.list(colTypes)
}


IsDateCol <- function(col, dateFormat) {
  
  good.rows <- ifelse(nchar(as.character(col)) > 10, FALSE, TRUE)
  
  if(length(which(!good.rows)) == 0) {
    
    !all(is.na(as.Date(as.character(col), format=dateFormat)))
  } else {
    FALSE
  }
}

GetDataFrame <- function(csvPath, filesType = "csv") {
  df <- read.csv(csvPath)
  df
}

# get data frame
df <- GetDataFrame(args)
# get types of columns
colTypes <- GetColumnsTypes(df)
colNames <- names(colTypes)
colnamesAndTypes <- ""
for(i in seq_along(colTypes) ) {
  colnamesAndTypes <- paste0(colnamesAndTypes, colNames[i], "=", colTypes[[i]], "|")
}
colnamesAndTypes