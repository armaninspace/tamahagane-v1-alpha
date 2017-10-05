args <- commandArgs(trailingOnly = TRUE)
# args <- '{"csv_path":"/home/sohail/textCluster/all-character-dataset-1484646772.csv", "img_path":"D:/R/wcloud_54_28_1.png", "chart_title":"WC title 1", "cols":"Last,First,Review.Title,Review","filters":[{"colname":"Ethnicity", "operator":"==", "required_val"
# :"WHITE"}]}'


suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(RJSONIO))


GetDataFrame <- function(csvPath, filesType = "csv") {
  
  df <- fread(input = csvPath,
              header = T,
              sep = ',',
              na.strings = c("", "NA"),
              stringsAsFactors = TRUE,
              encoding = "Latin-1")
  
  df <- as.data.frame(df)
  df
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
colNames     <- chartOptions$cols
colNames <- strsplit(colNames,",")

imgPath     <- chartOptions$img_path


df <- GetDataFrame(csvPath)

if(length(chartOptions$filters) > 0) {

  
  # generate a string of all filters
  filterStr <- ""
  filterContainsList <- list()
  for (i in seq_along(chartOptions$filters)) {
    
    colname <- chartOptions$filters[[i]][["colname"]]
    operator <- chartOptions$filters[[i]][["operator"]]
    required_val <- chartOptions$filters[[i]][["required_val"]]
    
    if (operator == "contains") {
      
      filterContainsList <- append(filterContainsList, 
                                   list(list(colname, required_val)))
    } else {
      if(operator == "=="){
        required_val_modify <- ifelse(operator == "==", 
                                      paste0(" '", required_val, "'"), 
                                      paste0(" ", required_val))
        
        filterStr <- paste0(filterStr, colname, " ", operator, 
                            required_val_modify, " & ")
      }
      else if(operator == "!="){
        required_val_modify <- ifelse(operator == "!=", 
                                      paste0(" '", required_val, "'"), 
                                      paste0(" ", required_val))
        
        filterStr <- paste0(filterStr, colname, " ", operator, 
                            required_val_modify, " & ")
      }
      
      
      
    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)
  
  #apply contains filters
  if (length(filterContainsList) > 0) {

    for (j in seq_along(filterContainsList)) {
      filterCol <- filterContainsList[[j]][[1]]
      filterVal <- filterContainsList[[j]][[2]]

      retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol],
                            ignore.case = TRUE)
      df <- df[retriveTrues, ]
    }
  }

  #apply numeric filters
  if (nchar(filterStr) > 0) {

    dfFiltered <- df %>%
      filter_(filterStr)
  } else {
    dfFiltered <- df
  }


  if (nrow(dfFiltered) > 0) {

    result <- list()

    dfFiltered <- lapply(dfFiltered, function(x) gsub('"',"",x))
    dfFiltered <- as.data.frame(dfFiltered)
    result <- append(result,list("cols"=colNames))
    result <- append(result,list("dataset"=dfFiltered))

    print(toJSON(result))

  }
  else{
    print("empty")
  }
} else{
  
  dfFiltered <- df
  result <- list()
  
  dfFiltered <- lapply(dfFiltered, function(x) gsub('"',"",x))
  dfFiltered <- as.data.frame(dfFiltered)
  result <- append(result,list("cols"=colNames))
  result <- append(result,list("dataset"=dfFiltered))
  
  print(toJSON(result))
  
}
