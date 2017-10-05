args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(rpart))
suppressPackageStartupMessages(library(rpart.plot))

GetDataFrame <- function(csvPath, filesType = "csv") {

  #df <- fread(input = csvPath,
         #          header = T,
          #          sep = ',',
           #         na.strings = c("", "NA"),
            #        stringsAsFactors = TRUE,
             #       encoding = "Latin-1")

        #df <- read.csv(csvPath)
        df <- read.csv(file = csvPath,
                header = TRUE,
                na.string = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1"
                )

  df <- as.data.frame(df)
  df
}

# coerce data types
convert.magic <- function(obj,types) {
  for (i in 1:length(obj)){
    FUN <- switch(types[i],character = as.character, 
                  numeric = as.numeric, 
                  factor = as.factor,
                  integer = as.integer,
                  logical = as.logical)
    obj[,i] <- FUN(obj[,i])
  }
  obj
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
chartTitle  <- chartOptions$chart_title
colNames    <- chartOptions$predictors
colNames    <- strsplit(colNames,",")
colTypes    <- chartOptions$cols_types
colTypes    <- strsplit(colTypes,",")
outcome     <- chartOptions$outcome
outcomeType    <- chartOptions$outcome_type

predictors <- c()
for (colName in colNames[[1]]) {

  predictors <- append(predictors, colName)
}

# make vector of columns coerse types
colsTypeCoerse <- c()
for (colType in colTypes[[1]]) {
  
  colsTypeCoerse <- append(colsTypeCoerse, colType)
}
colsTypeCoerse <- append(colsTypeCoerse, outcomeType)

customFormula <- as.formula(paste(outcome, "~",paste(predictors,collapse="+")))

# get data frame
df <- GetDataFrame(csvPath) # csvPath

decisionMethod <- ifelse(nrow(table(df[, outcome])) < 15, yes = "class",
                         no = "anova")

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

      required_val_modify <- ifelse(operator == "==",
                                    paste0(" '", required_val, "'"),
                                    paste0(" ", required_val))

      filterStr <- paste0(filterStr, colname, " ", operator,
                          required_val_modify, " & ")

    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)


  # apply contains filters
  if (length(filterContainsList) > 0) {

    for (j in seq_along(filterContainsList)) {
      filterCol <- filterContainsList[[j]][[1]]
      filterVal <- filterContainsList[[j]][[2]]

      retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol],
                            ignore.case = TRUE)
      df <- df[retriveTrues, ]
    }
  }

  # apply numeric filters
  if (nchar(filterStr) > 0) {

    dfFiltered <- df %>%
      filter_(filterStr)
  } else {
    dfFiltered <- df
  }

  if (nrow(dfFiltered) > 20) {

    # select desired columns
    for (variable in colNames) {
  
      selectedColsDF <- dfFiltered[c(variable, outcome)]
    }
    
    # coerce types
    selectedColsDF <- convert.magic(selectedColsDF, colsTypeCoerse)
    
    if(outcomeType == "factor"){
      method <- "class"
    }
    else{
      method <- "anova"
    }
    
    tre <- rpart(formula = customFormula, data = selectedColsDF, method = method)
    
    png(imgPath)
    rpart.plot(tre)
    dev.off()
  }

} else {

  # select desired columns
  for (variable in colNames) {

    selectedColsDF <- df[c(variable, outcome)]
  }
  
  # coerce types
  selectedColsDF <- convert.magic(selectedColsDF, colsTypeCoerse)

  if(outcomeType == "factor"){
    method <- "class"
  }
  else{
    method <- "anova"
  }
  
  tre <- rpart(formula = customFormula, data = selectedColsDF, method = method)
  
  png(imgPath)
  rpart.plot(tre)
  dev.off()
  
  # 
  # fit <- rpart(customFormula, method=decisionMethod, data=selectedColsDF)
  # png(imgPath)
  # # plot(fit, uniform=TRUE, main=chartTitle)
  # # text(fit, use.n=TRUE, all=TRUE, cex=.8)
  # dev.off()

}