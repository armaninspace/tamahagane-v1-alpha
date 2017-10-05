args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(gmodels))

# random number set
set.seed(1776)

# inbound contract check
inboundContractCheck <- list()

GetDataFrame <- function(csvPath, filesType = "csv") {
  
  tryCatch({
    
    df <- fread(input = csvPath,
                header = T,
                sep = ',',
                na.strings = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1")
    
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
    df <- df[complete.rows,]
    df
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_reading_csv" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_reading_csv" = err))
  }) # End tryCatch
  
}

# coerce data types
convert.magic <- function(obj, types) {
  
  tryCatch({
    
    for (i in 1:length(obj)){
      FUN <- switch(types[i],character = as.character, 
                    numeric = as.numeric, 
                    factor = as.factor,
                    integer = as.integer,
                    logical = as.logical)
      obj[,i] <- FUN(obj[,i])
    }
    obj
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_coerce" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_coerce" = err))
  }) # End tryCatch
  
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
outputPath     <- chartOptions$img_path
xCol        <- chartOptions$x_col
yCol        <- chartOptions$y_col
xColType    <- chartOptions$x_col_type
yColType    <- chartOptions$y_col_type
chartTitle  <- chartOptions$chart_title


# check if required number of arguments are available.
if (length(chartOptions) < 7) {
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("required_args_int" = 7))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}

# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))



factorCheck <- 0

#check if both colunms numeric
if(xColType == "factor" | yColType == "factor"){
  factorCheck <- 1 
}

if(factorCheck == 0){
  inboundContractCheck <- append(inboundContractCheck, list("factor_coulnm_not_found" = "Factor colunm not found"))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Factor colunm not found.")
}

# check if csv load successfully or stop execution
if(length(inboundContractCheck[['error_reading_csv']]) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("error reading csv.")
}

# log csv load time
inboundContractCheck <- append(inboundContractCheck, 
                               list("csv_load_time_elapsed" = 
                                      csvLoadTimeElapsed[['elapsed']]))

# log if csv loaded successfully
if(nrow(df) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = TRUE))
  inboundContractCheck <- append(inboundContractCheck, list("csv_number_of_rows" = nrow(df)))
} else {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = FALSE))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("CSV not loaded successfully.")
}


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
    
    # apply log time
    containsFiltersTimeElapsed <- system.time(
      for (j in seq_along(filterContainsList)) {
        filterCol <- filterContainsList[[j]][[1]]
        filterVal <- filterContainsList[[j]][[2]]
        
        retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol], 
                              ignore.case = TRUE)
        df <- df[retriveTrues, ]
      })
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("contains_fillters_time_elapsed" = 
                                          containsFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after contains filters
    if(nrow(df) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter_int" = nrow(df)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying contains filters.")
    }
  }
  
  
  # apply numeric filters
  if (nchar(filterStr) > 0) {
    
    # apply log time
    numericFiltersTimeElapsed <- system.time(
      dfFiltered <- df %>%
        filter_(filterStr))
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("numeric_fillters_time_elapsed" = 
                                          numericFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after numeric filters
    if(nrow(dfFiltered) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter_int" = nrow(dfFiltered)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying numeric filters.")
    }
    
  } else {
    dfFiltered <- df
  }
    
  dfFiltered <- dfFiltered %>%
    select(xCol, yCol)
  
  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType))
  )
  
  # check if both columns unique length is one
  if (nrow(unique(dfFiltered[1])) == 1 | nrow(unique(dfFiltered[2])) == 1) {
    inboundContractCheck <- append(inboundContractCheck, list("both_columns_unique_length_is_one" = TRUE))
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("Both columns unique length is one")
  }
  
  # check if rows greater than 5000 then take first 5000 rows.
  if (nrow(dfFiltered) > 5000) {
    inboundContractCheck <- append(inboundContractCheck, list("warning_limited_rows_taken" = TRUE))
    dfFiltered <- dfFiltered[sample(nrow(dfFiltered),5000),]
  }
  
  
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  
  options(warn=-1)
  if (nrow(dfFiltered) > 0) {
    
    
    #check if numeric coulunm selected
    if(xColType == "numeric" | yColType == "numeric" | xColType == "integer" | yColType == "integer"){
      outputWarning = FALSE
      outputError = FALSE
      tryCatch({
        
        
        
        crosstabBiglist <- list()
        
        namesList <- list()
        
        namesList[["cols_and_chart_title"]] = list("chart_title"= chartTitle, "x_col"= xCol, "y_col"= yCol, "x_col_type"= xColType, "y_col_type"= yColType)
        crosstabBiglist <- append(crosstabBiglist,namesList)
        levellist <- list()
        counter <- 1
        crosstabBiglist <- append(crosstabBiglist,list("bigtotal"=nrow(dfFiltered)))
        datarowlist <- list()
        
        
        if(xColType == "factor"){
          crosstabBiglist <- append(crosstabBiglist,list("bigmean"=mean(dfFiltered[[yCol]])))
          Levelscol <- levels(dfFiltered[[xCol]])
          
          for (i in Levelscol){
            
            
            #data row list
            levellist <- list()
            factorMeans <- mean(dfFiltered[grep(i, dfFiltered[[xCol]]), yCol])
            levelstotal <- length(dfFiltered[grep(i, dfFiltered[[xCol]]), yCol])
            levellist[["name"]] = i
            levellist[["total"]] = levelstotal
            levellist[["mean"]] = factorMeans
            
            #append data row in list
            datarowlist[[counter]] <- levellist
            
            # increment counter
            counter <- counter + 1
          }
          
        }
        else{
          
          crosstabBiglist <- append(crosstabBiglist,list("bigmean"=mean(dfFiltered[[xCol]])))
          Levelscol <- levels(dfFiltered[[yCol]])
          
          for (i in Levelscol){
            
            
            #data row list
            levellist <- list()
            factorMeans <- mean(dfFiltered[grep(i, dfFiltered[[yCol]]), xCol])
            levelstotal <- length(dfFiltered[grep(i, dfFiltered[[yCol]]), xCol])
            levellist[["name"]] = i
            levellist[["total"]] = levelstotal
            levellist[["mean"]] = factorMeans
            
            #append data row in list
            datarowlist[[counter]] <- levellist
            
            # increment counter
            counter <- counter + 1
          }
          
        }
        
        
        crosstabBiglist <- append(crosstabBiglist,list("mid_rows"=datarowlist))
        # write JSON in output file.
        jsonData <- gsub("\n","", toJSON(crosstabBiglist))
        write(jsonData, outputPath)
        
      }, warning = function(war) {
        outputWarning = TRUE
        
        # warning handler picks up where warning was generated
        inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
      }, error = function(err) {
        outputError = TRUE
        # error handler picks up where error was generated
        inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))
        
      }) # End tryCatch
      
      # output generated successfully
      if(! outputError) {
        inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
      } else {
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      }
      print(toJSON(inboundContractCheck))
    }
    else {

      outputWarning = FALSE
      outputError = FALSE
      
      tryCatch({
        
        # draw crosstabs
        chartGenerateTimeElapsed <- system.time (
          dat <- withCallingHandlers(
            suppressWarnings(CrossTable(dfFiltered[[1]], dfFiltered[[2]], 
                                        chisq = TRUE, expected = TRUE))
          )
        )

        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("chart_generate_time_elapsed" =
                                              chartGenerateTimeElapsed[['elapsed']]))
        
        tableRowNames <- rownames(dat$t)
        tableColNames <- colnames(dat$t)
        
        # remove column names
        rownames(dat$t) <- NULL
        colnames(dat$t) <- NULL
        colnames(dat$chisq$expected) <- NULL
        colnames(dat$prop.row) <- NULL
        colnames(dat$prop.col) <- NULL
        colnames(dat$prop.tbl) <- NULL
        
        # table row counter
        counter <- 1
        
        # crosstabs List
        crosstabsList <- list()
        
        # enter columns and chart title
        namesList <- list()
        #namesList[["cols_and_chart_title"]] = list("chart_title"= chartTitle, "x_col"= xCol, "y_col"= yCol)
        namesList[["cols_and_chart_title"]] = list("chart_title"= chartTitle, "x_col"= xCol, "y_col"= yCol, "x_col_type"= xColType, "y_col_type"= yColType)
        crosstabsList <- append(crosstabsList, namesList)

        # create row data to enter in output list
        rowList <- list()
        rowList[["first_row"]] = tableColNames
        
        # enter first row
        crosstabsList <- append(crosstabsList, rowList)
        
        # grand total
        grandTotal <- 0
        for(i in 1:nrow(dat$t)) {
          grandTotal <- grandTotal + sum(dat$t[i,])
        }
        
        # mid rows List
        midRowsList <- list()

        # loop through all rows and generate output list
        for(i in 1:nrow(dat$t)) {
          # create row name
          rowName <- paste("row", counter, sep="-")
          
          # increment counter
          counter <- counter + 1
          
          # create row data to enter in output list
          rowList <- list()
          #rowList[[rowName]] <- list("row_name"= as.numeric(tableRowNames[i]),
          rowList[[rowName]] <- list("row_name"= tableRowNames[i],
                                     "observed_value"= dat$t[i,],
                                     "expected_value"= round(dat$chisq$expected[i,],3),
                                     "chisq_value"= round((dat$chisq$expected[i,] - dat$t[i,])^2 / dat$chisq$expected[i,],3),
                                     "row_prop"= round(dat$prop.row[i,],3),
                                     "col_prop"= round(dat$prop.col[i,],3),
                                     "table_total_prop"= round(dat$prop.tbl[i,],3),
                                     "row_total"= round(sum(dat$t[i,]),3),
                                     "row_total_prop"= round(sum(dat$t[i,]) / grandTotal,3)
          )
          
          # append row in list
          midRowsList <- append(midRowsList, rowList)
          
        }

        # append mid rows in main list
        crosstabsList <- append(crosstabsList, list("mid_rows" = midRowsList))
        
        # store cols total
        colsTotal <- c()
        # store cols total proportion
        colsTotalProportion <- c()
        
        # loop through all columns and generate output list for last row
        for(j in 1:ncol(dat$t)) {
          
          # store cols total
          colsTotal <- append(colsTotal, round(sum(dat$t[,j]),3))
          
          # store cols total proportion
          colsTotalProportion <- append(colsTotalProportion, 
                                        round(sum(dat$t[,j]) / grandTotal,3))
        }
        
        
        
        # create row data to enter in output list
        rowList <- list()
        rowList[["last_row"]] = list("row_name"= "Column Total", 
                                     "column_totals"= colsTotal,
                                     "column_total_porportion" = colsTotalProportion,
                                     "grand_total"= grandTotal
        )
        
        # enter last row
        crosstabsList <- append(crosstabsList, rowList)

        # write JSON in output file.
        jsonData <- gsub("\n","", toJSON(crosstabsList))
        write(jsonData, outputPath)

      }, warning = function(war) {
        outputWarning = TRUE
        print(war)
        # warning handler picks up where warning was generated
        inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
      }, error = function(err) {
        outputError = TRUE
        print(err)
        # error handler picks up where error was generated
        inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))
        
      }) # End tryCatch
      
      # output generated successfully
      if(! outputError) {
        inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
      } else {
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      }
      print(toJSON(inboundContractCheck))
      
    } #end else both are factors 
    
    
  }
  
} else {
  
  dfFiltered <- df
  
    
    dfFiltered <- dfFiltered %>%
      select(xCol, yCol)
    
    # coerce types
    coerceTimeElapsed <- system.time(
      dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType))
    )
  
    
  # check if rows greater than 5000 then take first 5000 rows.
  if (nrow(dfFiltered) > 5000) {
     inboundContractCheck <- append(inboundContractCheck, list("warning_limited_rows_taken" = TRUE))
     dfFiltered <- dfFiltered[sample(nrow(dfFiltered),5000),]
  }
    
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  
  options(warn=-1)
  if (nrow(dfFiltered) > 0) {
   
    
    #check if numeric coulunm selected
    if(xColType == "numeric" | yColType == "numeric" | xColType == "integer" | yColType == "integer"){
      
      outputWarning = FALSE
      outputError = FALSE
      tryCatch({

     

      crosstabBiglist <- list()

      namesList <- list()
      
      namesList[["cols_and_chart_title"]] = list("chart_title"= chartTitle, "x_col"= xCol, "y_col"= yCol, "x_col_type"= xColType, "y_col_type"= yColType)
      crosstabBiglist <- append(crosstabBiglist,namesList)
      levellist <- list()
      counter <- 1
      crosstabBiglist <- append(crosstabBiglist,list("bigtotal"=nrow(dfFiltered)))
      datarowlist <- list()
      
      
      if(xColType == "factor"){
        crosstabBiglist <- append(crosstabBiglist,list("bigmean"=mean(dfFiltered[[yCol]])))
        Levelscol <- levels(dfFiltered[[xCol]])
        
        for (i in Levelscol){
          
          
          #data row list
          levellist <- list()
          factorMeans <- mean(dfFiltered[grep(i, dfFiltered[[xCol]]), yCol])
          levelstotal <- length(dfFiltered[grep(i, dfFiltered[[xCol]]), yCol])
          levellist[["name"]] = i
          levellist[["total"]] = levelstotal
          levellist[["mean"]] = factorMeans
          
          #append data row in list
          datarowlist[[counter]] <- levellist
          
          # increment counter
          counter <- counter + 1
        }
        
      }
      else{
        crosstabBiglist <- append(crosstabBiglist,list("bigmean"=mean(dfFiltered[[xCol]])))
        Levelscol <- levels(dfFiltered[[yCol]])
        
        for (i in Levelscol){
          
          
          #data row list
          levellist <- list()
          factorMeans <- mean(dfFiltered[grep(i, dfFiltered[[yCol]]), xCol])
          levelstotal <- length(dfFiltered[grep(i, dfFiltered[[yCol]]), xCol])
          levellist[["name"]] = i
          levellist[["total"]] = levelstotal
          levellist[["mean"]] = factorMeans
          
          #append data row in list
          datarowlist[[counter]] <- levellist
          
          # increment counter
          counter <- counter + 1
        }
        
      }
      
      
      crosstabBiglist <- append(crosstabBiglist,list("mid_rows"=datarowlist))

      # write JSON in output file.
      jsonData <- gsub("\n","", toJSON(crosstabBiglist))
      write(jsonData, outputPath)
      
      }, warning = function(war) {
        outputWarning = TRUE

        # warning handler picks up where warning was generated
        inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
      }, error = function(err) {
        outputError = TRUE
        # error handler picks up where error was generated
        inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

      }) # End tryCatch

      # output generated successfully
      if(! outputError) {
        inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
      } else {
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      }
      print(toJSON(inboundContractCheck))
      
    }
    else {
      
      outputWarning = FALSE
      outputError = FALSE
      tryCatch({
        
        # draw crosstabs
        chartGenerateTimeElapsed <- system.time (
          dat <- withCallingHandlers(
            suppressWarnings(CrossTable(dfFiltered[[1]], dfFiltered[[2]], 
                                        chisq = TRUE, expected = TRUE))
          )
        )
        
        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("chart_generate_time_elapsed" =
                                              chartGenerateTimeElapsed[['elapsed']]))
        
        tableRowNames <- rownames(dat$t)
        tableColNames <- colnames(dat$t)
        
        # remove column names
        rownames(dat$t) <- NULL
        colnames(dat$t) <- NULL
        colnames(dat$chisq$expected) <- NULL
        colnames(dat$prop.row) <- NULL
        colnames(dat$prop.col) <- NULL
        colnames(dat$prop.tbl) <- NULL
        
        # table row counter
        counter <- 1
        
        # crosstabs List
        crosstabsList <- list()
        
        # enter columns and chart title
        namesList <- list()
        namesList[["cols_and_chart_title"]] = list("chart_title"= chartTitle, "x_col"= xCol, "y_col"= yCol, "x_col_type"= xColType, "y_col_type"= yColType)
        
        crosstabsList <- append(crosstabsList, namesList)
        
        # create row data to enter in output list
        rowList <- list()
        rowList[["first_row"]] = tableColNames
        
        # enter first row
        crosstabsList <- append(crosstabsList, rowList)
        
        # grand total
        grandTotal <- 0
        for(i in 1:nrow(dat$t)) {
          grandTotal <- grandTotal + sum(dat$t[i,])
        }
        
        # mid rows List
        midRowsList <- list()
        
        # loop through all rows and generate output list
        for(i in 1:nrow(dat$t)) {
          
          # create row name
          rowName <- paste("row", counter, sep="-")
          
          # increment counter
          counter <- counter + 1
          
          # create row data to enter in output list
          rowList <- list()
          rowList[[rowName]] <- list("row_name"= tableRowNames[i], 
                                     "observed_value"= dat$t[i,],
                                     "expected_value"= round(dat$chisq$expected[i,],3),
                                     "chisq_value"= round((dat$chisq$expected[i,] - dat$t[i,])^2 / dat$chisq$expected[i,],3),
                                     "row_prop"= round(dat$prop.row[i,],3),
                                     "col_prop"= round(dat$prop.col[i,],3),
                                     "table_total_prop"= round(dat$prop.tbl[i,],3),
                                     "row_total"= round(sum(dat$t[i,]),3),
                                     "row_total_prop"= round(sum(dat$t[i,]) / grandTotal,3)
          )
          
          # append row in list
          midRowsList <- append(midRowsList, rowList)
          
        }
        
        # append mid rows in main list
        crosstabsList <- append(crosstabsList, list("mid_rows" = midRowsList))
        
        # store cols total
        colsTotal <- c()
        # store cols total proportion
        colsTotalProportion <- c()
        
        # loop through all columns and generate output list for last row
        for(j in 1:ncol(dat$t)) {
          
          # store cols total
          colsTotal <- append(colsTotal, round(sum(dat$t[,j]),3))
          
          # store cols total proportion
          colsTotalProportion <- append(colsTotalProportion, 
                                        round(sum(dat$t[,j]) / grandTotal,3))
        }
        
        
        
        # create row data to enter in output list
        rowList <- list()
        rowList[["last_row"]] = list("row_name"= "Column Total", 
                                     "column_totals"= colsTotal,
                                     "column_total_porportion" = colsTotalProportion,
                                     "grand_total"= grandTotal
        )
        
        # enter last row
        crosstabsList <- append(crosstabsList, rowList)
        
        # write JSON in output file.
        jsonData <- gsub("\n","", toJSON(crosstabsList))
        write(jsonData, outputPath)
        
        
      }, warning = function(war) {
        outputWarning = TRUE
        
        # warning handler picks up where warning was generated
        inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
      }, error = function(err) {
        outputError = TRUE
        # error handler picks up where error was generated
        inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))
        
      }) # End tryCatch
      
      # output generated successfully
      if(! outputError) {
        inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
      } else {
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      }
      print(toJSON(inboundContractCheck))
      
      
    } # End else both are factors
    
  }
}
objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))