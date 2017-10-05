args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))

# random number set
set.seed(1776)

#colors <- c('rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(141,211,199)','rgb(251,128,114)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(26,152,80)','rgb(118,42,131)','rgb(53,151,143)','rgb(191,129,45)','rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(141,211,199)','rgb(251,128,114)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(26,152,80)','rgb(118,42,131)','rgb(53,151,143)','rgb(191,129,45)','rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(141,211,199)','rgb(251,128,114)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(26,152,80)','rgb(118,42,131)','rgb(53,151,143)','rgb(191,129,45)');

# inbound contract check
inboundContractCheck <- list()

GetDataFrame <- function(csvPath, filesType = "csv") {
  
  tryCatch({
    
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
    # keep only complete rows
    complete.rows <- complete.cases(df)
    #df <- df[complete.rows,]
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

addHisto <- function(histoObj, cols, data) {
    for(col in cols[[1]]){
        histoObj <- add_histogram(histoObj, x = data[[col]], name = col)
    }
   # histoObj <- layout(histoObj,barmode = "overlay")
    histoObj
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
xCol        <- chartOptions$x_col
colNames    <- strsplit(xCol,",")
xColType    <- chartOptions$x_col_type
colTypes    <- strsplit(xColType,",")
chartTitle  <- chartOptions$chart_title
xTitle      <- chartOptions$x_title
yTitle      <- chartOptions$y_title

xTitle <- ifelse(is.null(xTitle), "X Col", xTitle)
yTitle <- ifelse(is.null(yTitle), "Y Col", yTitle)
chartTitle <- ifelse(is.null(chartTitle), "Histogram", chartTitle)

f <- list(
  family = "Open Sans, verdana, arial, sans-serif",
  size = 16,
  color = "#444444"
)

x <- list(
  title = xTitle,
  titlefont = f
)
y <- list(
  title = yTitle,
  titlefont = f
)

# make vector of columns coerse types
colsTypeCoerse <- c()
for (colType in colTypes[[1]]) {

    colsTypeCoerse <- append(colsTypeCoerse, colType)
}

# check if required number of arguments are available.
if (length(chartOptions) < 5) {
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("required_args_int" = 5))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}

# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))
if(!is.data.frame(df)){
     toJSON(df)
 }else{
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
      
      required_val_modify <- ifelse(operator == "==" || operator == "!=",
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

  # select desired columns
  for (variable in colNames) {
      dfFiltered <- dfFiltered[c(variable)]
  }
    
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
      # select desired columns
      for (variable in colNames) {
          dfFiltered <- dfFiltered[c(variable)]
      }
  }

  # coerce types
  coerceTimeElapsed <- system.time(
      dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
  )


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
  dfFiltered = dfFiltered %>% na.omit()
  if (nrow(dfFiltered) > 0) {

    #complete.rows <- complete.cases(dfFiltered)
    #dfFiltered <- dfFiltered[complete.rows,]
    outputWarning = FALSE
    outputError = FALSE
    tryCatch({

      p <- plot_ly(alpha = 0.3)
     result <- try(
        chartGenerateTimeElapsed <- system.time (
          #p <- plot_ly(x = dfFiltered[[1]], type = "histogram") %>%
           # layout(xaxis = x)
           for(col in colNames[[1]]){
                 p <- add_histogram(p, x = dfFiltered[[col]], name = col)
            }
       )
        , silent = TRUE)
       p <- layout(p, xaxis = x, barmode = "overlay")
       #result <- try(
       #chartGenerateTimeElapsed <- system.time (
            #p <- p1
       #)
       #, silent = TRUE)
      
      # Process any error messages
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        
        # set output message to error
        outputError = TRUE
        
        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))
        
        # Restore default warning reporting
        options(warn=0)
      } else {
        
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)), 
          silent = TRUE)
        
        
        # Process any error messages
        if (class(outputResult) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)
          
          # set output message to error
          outputError = TRUE
          
          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))
          
          # Restore default warning reporting
          options(warn=0)
        }
        
        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck, 
                                       list("chart_generate_time_elapsed" = 
                                              chartGenerateTimeElapsed[['elapsed']]))
        
        # log output time
        inboundContractCheck <- append(inboundContractCheck, 
                                       list("output_time_elapsed" = 
                                              outputTimeElapsed[['elapsed']]))
      }
      
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
    
  } else {
        inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter" = nrow(dfFiltered)))
        inboundContractCheck <- append(inboundContractCheck, list("nrows_for_plot_after_filter" = FALSE))
        inboundContractCheck <- append(inboundContractCheck, list("nrows_message" = 'Not enough rows for generating Chart!'))
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
        print(toJSON(inboundContractCheck))
        stop("Not Enough rows for generating Correlation Matrix.")
      }
  
} else {

    # select desired columns
    for (variable in colNames) {

        dfFiltered <- df[c(variable)]
    }


    # coerce types
    coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
    )
  
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
  dfFiltered = dfFiltered %>% na.omit()
  if (nrow(dfFiltered) > 0) {

    #complete.rows <- complete.cases(dfFiltered)
    #dfFiltered <- dfFiltered[complete.rows,]
    outputWarning = FALSE
    outputError = FALSE
    tryCatch({

      p <- plot_ly(alpha = 0.3)

       result <- try(
        chartGenerateTimeElapsed <- system.time (
          #p <- plot_ly(x = dfFiltered[[1]], type = "histogram") %>%
           # layout(xaxis = x))
           for(col in colNames[[1]]){
               p <- add_histogram(p, x = dfFiltered[[col]], name = col)
            }

          )
        , silent = TRUE)
        p <- layout(p, xaxis = x, barmode = "overlay")

      # Process any error messages
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        
        # set output message to error
        outputError = TRUE
        
        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))
        
        # Restore default warning reporting
        options(warn=0)
      } else {
        
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)), 
          silent = TRUE)
        
        
        # Process any error messages
        if (class(outputResult) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)
          
          # set output message to error
          outputError = TRUE
          
          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))
          
          # Restore default warning reporting
          options(warn=0)
        }
        
        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck, 
                                       list("chart_generate_time_elapsed" = 
                                              chartGenerateTimeElapsed[['elapsed']]))
        
        # log output time
        inboundContractCheck <- append(inboundContractCheck, 
                                       list("output_time_elapsed" = 
                                              outputTimeElapsed[['elapsed']]))
      }
      
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
    
  } else {
        inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter" = nrow(dfFiltered)))
        inboundContractCheck <- append(inboundContractCheck, list("nrows_for_plot_after_filter" = FALSE))
        inboundContractCheck <- append(inboundContractCheck, list("nrows_message" = 'Not enough rows for generating Chart!'))
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
        print(toJSON(inboundContractCheck))
        stop("Not Enough rows for generating Correlation Matrix.")
      }
}
}

objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))




